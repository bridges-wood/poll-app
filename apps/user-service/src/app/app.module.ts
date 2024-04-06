import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { DistributedAuthGuard } from '@org/auth';
import { ConfigModule, ConfigService } from '@org/config';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
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
          transformSchema: prepareSchemaForFederation,
        };
      },
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: DistributedAuthGuard }],
})
export class AppModule {}
