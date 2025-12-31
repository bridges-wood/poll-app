import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { extractFromHeader, useJWT } from '@graphql-yoga/plugin-jwt';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { SigningKeyProvider } from '@org/auth';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { useSchema } from 'graphql-yoga';
import { firstValueFrom } from 'rxjs';
import DefaultQueriesConfigFactory, {
  DefaultQueriesConfig,
} from './config/factories/default-queries.config.factory';
import { CryptoModule } from './crypto/crypto.module';
import { LocalSigningKeyProvider } from './crypto/local-signing-key-provider';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SchemaStitcher } from './schema/schema-stitcher';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvironmentConfigFactory],
    }),
    CryptoModule,
    EndpointsModule,
    SchemaModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [
        ConfigModule.forFeature(DefaultQueriesConfigFactory),
        SchemaModule,
        CryptoModule,
      ],
      inject: [
        DefaultQueriesConfigFactory.KEY,
        SchemaStitcher,
        LocalSigningKeyProvider,
      ],
      driver: YogaDriver,
      useFactory: async (
        defaultQueriesConfig: DefaultQueriesConfig,
        schemaStitcher: SchemaStitcher,
        signingKeyProvider: SigningKeyProvider,
      ) => ({
        healthCheckEndpoint: '/health',
        introspection: true,
        graphiql: {
          defaultTabs: defaultQueriesConfig.queries.map((query) => ({
            query,
          })),
          shouldPersistHeaders: true,
        },
        autoSchemaFile: true,
        transformAutoSchemaFile: true,
        buildSchemaOptions: {
          directives: [
            new GraphQLDirective({
              name: 'search',
              locations: [DirectiveLocation.FIELD_DEFINITION],
            }),
          ],
        },
        transformSchema: async (localSchema) => {
          return await schemaStitcher.stitchWithRemotes(localSchema);
        },
        plugins: [
          useSchema(() => firstValueFrom(schemaStitcher.stitchedSchema$)),
          useJWT({
            signingKeyProviders: [signingKeyProvider.build()],
            tokenLookupLocations: [
              extractFromHeader({ name: 'authorization', prefix: 'Bearer' }),
            ],
            tokenVerification: {
              issuer: 'poll-app:auth',
              algorithms: ['PS256'],
              audience: 'poll-app:api',
            },
            extendContext: true,
            reject: {
              missingToken: false,
              invalidToken: true,
            },
          }),
          useExtendedValidation({
            rules: [OneOfInputObjectsRule],
          }),
        ],
        batching: true,
        path: 'graphql',
      }),
    }),
  ],
})
export class AppModule {}
