import { Module } from '@nestjs/common';
import { LogModule } from '@org/log';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { ExecutorFactory } from '../executors/executor-factory';
import { ExecutorsModule } from '../executors/executors.module';
import { SchemaStitcher } from './schema-stitcher';

@Module({
  imports: [EndpointsModule, ExecutorsModule, LogModule],
  providers: [SchemaStitcher, ExecutorFactory],
  exports: [SchemaStitcher],
})
export class SchemaModule {}
