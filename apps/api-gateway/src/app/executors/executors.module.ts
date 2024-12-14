import { Module } from '@nestjs/common';
import { ExecutorFactory } from './executor-factory';

@Module({
  providers: [ExecutorFactory],
  exports: [ExecutorFactory],
})
export class ExecutorsModule {}
