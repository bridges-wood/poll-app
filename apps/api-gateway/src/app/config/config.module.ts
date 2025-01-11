import { Module } from '@nestjs/common';
import { LogModule } from '@org/log';
import { ConfigService } from './config.service';

@Module({
  imports: [LogModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
