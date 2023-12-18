import { Module } from '@nestjs/common';
import { ErrorFormatterModule } from './formatter/error-formatter.module';

@Module({
  imports: [ErrorFormatterModule],
  exports: [ErrorFormatterModule],
})
export class ErrorsModule {}
