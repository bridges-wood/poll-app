import { Module } from '@nestjs/common';
import { GraphQLSchemaBuilderModule } from '@nestjs/graphql';
import { ConfigModule } from '../config/config.module';
import { SchemaLoader } from './schema-loader';
import { SchemaStitcher } from './schema-stitcher';

@Module({
  imports: [ConfigModule, GraphQLSchemaBuilderModule],
  providers: [SchemaLoader, SchemaStitcher],
  exports: [SchemaLoader],
})
export class SchemaModule {}
