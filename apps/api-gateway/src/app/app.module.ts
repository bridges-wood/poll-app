import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { useSchema } from 'graphql-yoga';
import { firstValueFrom } from 'rxjs';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SchemaStitcher } from './schema/schema-stitcher';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
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
          graphiql: config.isDev(),
          autoSchemaFile: true,
          transformAutoSchemaFile: true,
          transformSchema: async (localSchema) => {
            return await schemaStitcher.stitchWithRemotes(localSchema);
          },
          plugins: [
            useSchema(() => firstValueFrom(schemaStitcher.stitchedSchema$)),
          ],
          subscriptions: {
            'graphql-ws': true,
          },
        };
      },
    }),
  ],
})
export class AppModule {}
