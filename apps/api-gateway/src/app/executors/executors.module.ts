import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import HmacConfigFactory from '@org/config/hmac.config.factory';
import { LogModule } from '@org/log';
import { ExecutorFactory } from './executor-factory';

const ConfigModules: DynamicModule[] = [
  ConfigModule.forFeature(HmacConfigFactory),
];

@Module({
  imports: [LogModule, ...ConfigModules],
  providers: [ExecutorFactory],
  exports: [ExecutorFactory, ...ConfigModules],
})
export class ExecutorsModule {}
