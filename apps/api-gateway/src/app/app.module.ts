import {
  OneOfInputObjectsRule,
  useExtendedValidation,
} from '@envelop/extended-validation';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { useHmacUpstreamSignature } from '@org/graphql/plugins';
import { HealthModule } from '@org/health';
import { useSchema } from 'graphql-yoga';
import { firstValueFrom } from 'rxjs';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SchemaStitcher } from './schema/schema-stitcher';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
    HealthModule,
    EndpointsModule,
    SchemaModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, SchemaModule],
      inject: [ConfigService, SchemaStitcher],
      driver: YogaDriver,
      useFactory: async (
        config: ConfigService,
        schemaStitcher: SchemaStitcher,
      ) => {
        return {
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
            useHmacUpstreamSignature({ secret: 'secret' }),
            useSchema(() => firstValueFrom(schemaStitcher.stitchedSchema$)),
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
