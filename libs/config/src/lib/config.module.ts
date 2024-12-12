import { Module } from '@nestjs/common';
import { ClientConfigService } from './client.config.service';
import { GatewayUrlProvider } from './factories';

@Module({
  providers: [ClientConfigService, GatewayUrlProvider],
  exports: [ClientConfigService, GatewayUrlProvider],
})
export class ConfigModule {}
