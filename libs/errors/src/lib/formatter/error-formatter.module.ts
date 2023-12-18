import { Module } from '@nestjs/common';
import { ErrorFormatter } from './formatter';

@Module({
  providers: [ErrorFormatter],
  exports: [ErrorFormatter],
})
export class ErrorFormatterModule {}
