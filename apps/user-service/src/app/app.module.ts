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
import { AuthGuardModule, DistributedAuthGuard } from '@org/auth';
import { ClientConfigService, ConfigModule } from '@org/config';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { RegistrationModule } from '@org/registration';
import { GraphQLDirective } from 'graphql';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // For Cron
    AuthGuardModule,
    UsersModule,
    PostsModule,
    RegistrationModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, ErrorsModule],
      inject: [ClientConfigService, ErrorFormatter],
      driver: YogaDriver,
      useFactory: (
        config: ClientConfigService,
        errorFormatter: ErrorFormatter,
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
            useHmacSignatureValidation({ secret: config.HMACSecret }),
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
