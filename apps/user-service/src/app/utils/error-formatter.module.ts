import { Module } from '@nestjs/common';
import { ErrorFormatter } from './error-formatter';

@Module({
  providers: [ErrorFormatter],
  exports: [ErrorFormatter],
})
export class ErrorFormatterModule {}
