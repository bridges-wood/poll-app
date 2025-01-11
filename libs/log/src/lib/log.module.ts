import { Module } from '@nestjs/common';
import { BaseLogger } from './base.logger';
import { DefaultLogger } from './default.logger';

@Module({
  providers: [
    {
      provide: BaseLogger,
      useClass: DefaultLogger,
    },
  ],
  exports: [BaseLogger],
})
export class LogModule {}
