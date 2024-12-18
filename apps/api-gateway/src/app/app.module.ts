import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { extractFromHeader, useJWT } from '@graphql-yoga/plugin-jwt';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { useSchema } from 'graphql-yoga';
import { firstValueFrom } from 'rxjs';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CryptoModule } from './crypto/crypto.module';
import { SigningKeyProviderFactory } from './crypto/signing-key-provider.factory';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SchemaStitcher } from './schema/schema-stitcher';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
    CryptoModule,
    EndpointsModule,
    SchemaModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, SchemaModule, CryptoModule],
      inject: [ConfigService, SchemaStitcher, SigningKeyProviderFactory],
      driver: YogaDriver,
      useFactory: async (
        config: ConfigService,
        schemaStitcher: SchemaStitcher,
        signingKeyProviderFactory: SigningKeyProviderFactory,
      ) => {
        return {
          healthCheckEndpoint: '/health',
          introspection: true,
          graphiql: {
            defaultTabs: config.getQueries().map((query) => ({
              query,
            })),
            shouldPersistHeaders: true,
          },
          autoSchemaFile: true,
          transformAutoSchemaFile: true,
          transformSchema: async (localSchema) => {
            return await schemaStitcher.stitchWithRemotes(localSchema);
          },
          plugins: [
            useSchema(() => firstValueFrom(schemaStitcher.stitchedSchema$)),
            useJWT({
              signingKeyProviders: [signingKeyProviderFactory.build()],
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
          subscriptions: {
            'graphql-ws': true,
          },
          batching: true,
          path: 'graphql',
        };
      },
    }),
  ],
})
export class AppModule {}
