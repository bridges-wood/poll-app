import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { UsersModule } from './users/users.module';
import { ErrorFormatter } from './utils/error-formatter';
import { ErrorFormatterModule } from './utils/error-formatter.module';

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
      imports: [ConfigModule, ErrorFormatterModule],
      inject: [ConfigService, ErrorFormatter],
      driver: ApolloFederationDriver,
      useFactory: (config: ConfigService, errorFormatter: ErrorFormatter) => {
        return {
          introspection: true,
          playground: config.isDev(),
          autoSchemaFile: { path: config.schemaFile, federation: 2 },
          sortSchema: true,
          formatError: errorFormatter.format,
        };
      },
    }),
  ],
})
export class AppModule {}
