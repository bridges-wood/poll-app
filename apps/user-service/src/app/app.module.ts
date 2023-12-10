import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { UsersModule } from './users/users.module';
import { ErrorFormatter } from './utils/error-formatter';
import { ErrorFormatterModule } from './utils/error-formatter.module';

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, ErrorFormatterModule],
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
})
export class AppModule {}
