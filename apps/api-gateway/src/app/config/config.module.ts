import { Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@org/config';
import { ConfigService } from './config.service';

@Module({
  imports: [BaseConfigModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
