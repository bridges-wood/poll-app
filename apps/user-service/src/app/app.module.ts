import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { useHmacSignatureValidation } from '@graphql-hive/gateway';
import { addTypes, DirectiveLocation } from '@graphql-tools/utils';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthGuardModule, DistributedAuthGuard, RemoteSigningKeyProvider, SigningModule } from '@org/auth';
import { ClientConfigService, ConfigModule } from '@org/config';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { serializeParams } from '@org/graphql/plugins';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { RegistrationModule } from '@org/registration';
import { GraphQLDirective } from 'graphql';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { extractFromHeader, useJWT } from '@graphql-yoga/plugin-jwt';

@Module({
  imports: [
    ScheduleModule.forRoot(), // For Cron
    AuthGuardModule,
    UsersModule,
    PostsModule,
    RegistrationModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, ErrorsModule, SigningModule],
      inject: [ClientConfigService, ErrorFormatter, RemoteSigningKeyProvider],
      driver: YogaDriver,
      useFactory: (
        config: ClientConfigService,
        errorFormatter: ErrorFormatter,
        signingKeyProvider: RemoteSigningKeyProvider,
      ) => {
        return {
          healthCheckEndpoint: '/health',
          introspection: true,
          graphiql: config.isDev(),
          autoSchemaFile: { path: config.schemaFile, federation: 2 },
          sortSchema: true,
          formatError: errorFormatter.format,
          subscriptions: {
            'graphql-ws': true,
          },
          transformAutoSchemaFile: true,
          transformSchema: prepareSchemaForFederation((schema) =>
            addTypes(schema, [
              new GraphQLDirective({
                name: 'oneOf',
                locations: [
                  DirectiveLocation.INPUT_OBJECT,
                  DirectiveLocation.FIELD_DEFINITION,
                ],
                args: {},
              }),
            ]),
          ),
          plugins: [
            !config.isDev() &&
              useHmacSignatureValidation({
                secret: config.HMACSecret,
                serializeParams: serializeParams,
              }),
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
          path: 'graphql',
        };
      },
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: DistributedAuthGuard }],
})
export class AppModule {}
