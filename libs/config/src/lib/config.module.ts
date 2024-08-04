import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { GatewayUrlProvider } from './factories';

@Module({
  providers: [ConfigService, GatewayUrlProvider],
  exports: [ConfigService, GatewayUrlProvider],
})
export class ConfigModule {}
