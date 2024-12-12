import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientConfigService, ConfigModule } from '@org/config';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { HealthModule } from '@org/health';
import { RegistrationModule } from '@org/registration';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
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
          introspection: true,
          graphiql: config.isDev(),
          autoSchemaFile: { path: config.schemaFile, federation: 2 },
          sortSchema: true,
          formatError: errorFormatter.format,
          subscriptions: {
            'graphql-ws': true,
          },
          transformAutoSchemaFile: true,
          transformSchema: prepareSchemaForFederation(),
          path: 'graphql',
        };
      },
    }),
  ],
})
export class AppModule {}
