import { useHmacSignatureValidation } from '@graphql-hive/gateway';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import HmacConfigFactory, { HmacConfig } from '@org/config/hmac.config.factory';
import SchemaConfigFactory, {
  SchemaConfig,
} from '@org/config/schema.config.factory';
import { CryptoModule } from '@org/crypto';
import { ErrorFormatter, ErrorsModule } from '@org/errors';
import { FirebaseModule } from '@org/firebase';
import { serializeParams } from '@org/graphql/plugins';
import { prepareSchemaForFederation } from '@org/graphql/transformers';
import { RegistrationModule } from '@org/registration';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvironmentConfigFactory],
    }),
    FirebaseModule.forRoot(),
    ScheduleModule.forRoot(), // For Cron
    CryptoModule,
    AuthModule,
    RegistrationModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [
        ConfigModule.forFeature(EnvironmentConfigFactory),
        ConfigModule.forFeature(SchemaConfigFactory),
        ConfigModule.forFeature(HmacConfigFactory),
        ErrorsModule,
      ],
      inject: [
        EnvironmentConfigFactory.KEY,
        SchemaConfigFactory.KEY,
        HmacConfigFactory.KEY,
        ErrorFormatter,
      ],
      driver: YogaDriver,
      useFactory: (
        environmentConfig: EnvironmentConfig,
        schemaConfig: SchemaConfig,
        hmacConfig: HmacConfig,
        errorFormatter: ErrorFormatter,
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
          transformSchema: prepareSchemaForFederation(),
          plugins: [
            !environmentConfig.isDev() &&
              useHmacSignatureValidation({
                secret: hmacConfig.secret,
                serializeParams: serializeParams,
              }),
          ],
          path: 'graphql',
        };
      },
    }),
  ],
})
export class AppModule {}
