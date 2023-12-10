import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SchemaLoader } from './schema/schema-loader';
import { SchemaModule } from './schema/schema.module';

const { allStitchingDirectives } = stitchingDirectives();

@Module({
  imports: [
    EndpointsModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      imports: [ConfigModule, SchemaModule],
      inject: [ConfigService, SchemaLoader],
      driver: YogaDriver,
      useFactory: async (config: ConfigService, schemaLoader: SchemaLoader) => {
        const stitchedSchema = await schemaLoader.load();

        return {
          introspection: true,
          graphiql: config.isDev(),
          autoSchemaFile: true,
          buildSchemaOptions: {
            directives: allStitchingDirectives,
          },
          schema: stitchedSchema,
          subscriptions: {
            'graphql-ws': true,
          },
        };
      },
    }),
  ],
})
export class AppModule {}
