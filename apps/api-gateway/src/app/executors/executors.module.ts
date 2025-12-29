import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import HmacConfigFactory from '@org/config/hmac.config.factory';
import { BaseLogger, LogModule } from '@org/log';
import { AuthVisitor } from '../extensions/auth.visitor';
import { SignatureVisitor } from '../extensions/signature.visitor';
import { ExecutorFactory } from './executor-factory';

const ConfigModules: DynamicModule[] = [
  ConfigModule.forFeature(HmacConfigFactory),
];

@Module({
  imports: [LogModule, ...ConfigModules],
  providers: [
    AuthVisitor,
    SignatureVisitor,
    {
      provide: ExecutorFactory,    
      inject: [AuthVisitor, SignatureVisitor, BaseLogger],
      useFactory: (authVisitor, signatureVisitor, logger) =>
        new ExecutorFactory([authVisitor, signatureVisitor], logger),
    },
  ],
  exports: [ExecutorFactory, ...ConfigModules],
})
export class ExecutorsModule {}
