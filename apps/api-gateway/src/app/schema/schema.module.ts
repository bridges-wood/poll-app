import { Module } from '@nestjs/common';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { ExecutorFactory } from '../executors/executor-factory';
import { SchemaStitcher } from './schema-stitcher';
import { ExecutorsModule } from '../executors/executors.module';

@Module({
  imports: [EndpointsModule, ExecutorsModule],
  providers: [SchemaStitcher, ExecutorFactory],
  exports: [SchemaStitcher],
})
export class SchemaModule {}
