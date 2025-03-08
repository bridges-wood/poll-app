import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { useHmacSignatureValidation } from '@graphql-hive/gateway';
import { addTypes, DirectiveLocation } from '@graphql-tools/utils';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { extractFromHeader, useJWT } from '@graphql-yoga/plugin-jwt';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import {
  AuthGuardModule,
  DistributedAuthGuard,
  RemoteSigningKeyProvider,
  SigningModule,
} from '@org/auth';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import HmacConfigFactory, { HmacConfig } from '@org/config/hmac.config.factory';
import SchemaConfigFactory, {
  SchemaConfig,
} from '@org/config/schema.config.factory';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { FirebaseModule } from '@org/firebase';
import { serializeParams } from '@org/graphql/plugins';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { RegistrationModule } from '@org/registration';
import { GraphQLDirective } from 'graphql';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    FirebaseModule.forRoot(),
    ScheduleModule.forRoot(), // For Cron
    AuthGuardModule,
    UsersModule,
    PostsModule,
    RegistrationModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [
        ConfigModule.forFeature(EnvironmentConfigFactory),
        ConfigModule.forFeature(SchemaConfigFactory),
        ConfigModule.forFeature(HmacConfigFactory),
        ErrorsModule,
        SigningModule,
      ],
      inject: [
        EnvironmentConfigFactory.KEY,
        SchemaConfigFactory.KEY,
        HmacConfigFactory.KEY,
        ErrorFormatter,
        RemoteSigningKeyProvider,
      ],
      driver: YogaDriver,
      useFactory: (
        environmentConfig: EnvironmentConfig,
        schemaConfig: SchemaConfig,
        hmacConfig: HmacConfig,
        errorFormatter: ErrorFormatter,
        signingKeyProvider: RemoteSigningKeyProvider,
      ) => {
        return {
          healthCheckEndpoint: '/health',
          introspection: true,
          graphiql: environmentConfig.isDev(),
          autoSchemaFile: { path: schemaConfig.schemaFile, federation: 2 },
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
            !environmentConfig.isDev() &&
              useHmacSignatureValidation({
                secret: hmacConfig.secret,
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
