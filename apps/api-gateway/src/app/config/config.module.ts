import { Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule, GatewayUrlProvider } from '@org/config';
import { ConfigService } from './config.service';

@Module({
  imports: [BaseConfigModule],
  providers: [ConfigService, GatewayUrlProvider],
  exports: [ConfigService, GatewayUrlProvider],
})
export class ConfigModule {}
