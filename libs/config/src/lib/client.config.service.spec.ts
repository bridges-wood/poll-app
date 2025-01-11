import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { ClientConfigService } from './client.config.service';
import { ConfigTokens } from './tokens';

describe('ClientConfigService', () => {
  let service: ClientConfigService;

  beforeEach(async () => {
    setupEnvironment();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigService,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: ConfigTokens.GATEWAY_URL,
          useValue: 'http://example.com',
        },
      ],
    }).compile();

    service = module.get<ClientConfigService>(ClientConfigService);
  });

  function setupEnvironment() {
    process.env['HMAC_SECRET'] = 'test';
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have gatewayUrl defined', () => {
    expect(service.gatewayUrl).toBe('http://example.com');
  });

  it('should set hasJwks to true when HAS_JWKS is true', () => {
    process.env['HAS_JWKS'] = 'true';
    const newService = new ClientConfigService(
      'http://example.com',
      new TestLogger(),
    );
    expect(newService.hasJwks).toBe(true);
  });

  it('should set hasJwks to false when HAS_JWKS is not true', () => {
    process.env['HAS_JWKS'] = 'false';
    const newService = new ClientConfigService(
      'http://example.com',
      new TestLogger(),
    );
    expect(newService.hasJwks).toBe(false);
  });
});
