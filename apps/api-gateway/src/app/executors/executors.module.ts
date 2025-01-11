import { Module } from '@nestjs/common';
import { LogModule } from '@org/log';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ExecutorFactory } from './executor-factory';

@Module({
  imports: [ConfigModule, LogModule],
  providers: [ExecutorFactory, ConfigService],
  exports: [ExecutorFactory],
})
export class ExecutorsModule {}
