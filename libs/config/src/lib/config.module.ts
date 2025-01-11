import { Module } from '@nestjs/common';
import { ClientConfigService } from './client.config.service';
import { GatewayUrlProvider } from './factory';
import { LogModule } from '@org/log';

@Module({
  imports: [LogModule],
  providers: [ClientConfigService, GatewayUrlProvider],
  exports: [ClientConfigService, GatewayUrlProvider],
})
export class ConfigModule {}
