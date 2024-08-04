import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { addTypes } from '@graphql-tools/utils';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthGuardModule, DistributedAuthGuard } from '@org/auth';
import { ConfigModule, ConfigService } from '@org/config';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { HealthModule } from '@org/health';
import { GraphQLDirective } from 'graphql';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    HealthModule,
    AuthGuardModule,
    UsersModule,
    PostsModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, ErrorsModule],
      inject: [ConfigService, ErrorFormatter],
      driver: YogaDriver,
      useFactory: (config: ConfigService, errorFormatter: ErrorFormatter) => {
        return {
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
                locations: ['INPUT_OBJECT', 'FIELD_DEFINITION'] as any[],
                args: {},
              }),
            ]),
          ),
          plugins: [
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
