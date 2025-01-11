import { Module } from '@nestjs/common';
import { LogModule } from '@org/log';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { ExecutorFactory } from '../executors/executor-factory';
import { ExecutorsModule } from '../executors/executors.module';
import { SchemaStitcher } from './schema-stitcher';

@Module({
  imports: [EndpointsModule, ExecutorsModule, ConfigModule, LogModule],
  providers: [SchemaStitcher, ExecutorFactory, ConfigService],
  exports: [SchemaStitcher],
})
export class SchemaModule {}
