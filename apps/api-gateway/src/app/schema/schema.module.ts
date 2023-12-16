import { Module } from '@nestjs/common';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { SchemaStitcher } from './schema-stitcher';

@Module({
  imports: [EndpointsModule],
  providers: [SchemaStitcher],
  exports: [SchemaStitcher],
})
export class SchemaModule {}
