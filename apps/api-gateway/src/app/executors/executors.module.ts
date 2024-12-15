import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ExecutorFactory } from './executor-factory';

@Module({
  imports: [ConfigModule],
  providers: [ExecutorFactory, ConfigService],
  exports: [ExecutorFactory],
})
export class ExecutorsModule {}
