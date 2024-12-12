import { Inject } from '@nestjs/common';
import { BaseConfigService } from './config.service';
import { ConfigTokens } from './tokens';

export class ClientConfigService extends BaseConfigService {
  constructor(@Inject(ConfigTokens.GATEWAY_URL) readonly gatewayUrl: string) {
    super();
  }
}
