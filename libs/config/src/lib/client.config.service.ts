import { Inject } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { BaseConfigService } from './config.service';
import { ConfigTokens } from './tokens';

export class ClientConfigService extends BaseConfigService {
  public readonly hasJwks: boolean;

  constructor(
    @Inject(ConfigTokens.GATEWAY_URL) readonly gatewayUrl: string,
    protected override readonly logger: BaseLogger,
  ) {
    super(logger);
    this.logger.setContext(ClientConfigService.name);
    this.hasJwks = process.env['HAS_JWKS'] === 'true';
  }
}
