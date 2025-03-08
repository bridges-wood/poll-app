import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { JwtConfigService } from './jwt.config.service';

describe('JwtConfigService', () => {
  let service: JwtConfigService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtConfigService,
        {
          provide: CryptoService,
          useValue: {
            exportPublicKey: jest.fn().mockResolvedValue('mockPublicKey'),
            exportPrivateKey: jest.fn().mockResolvedValue('mockPrivateKey'),
          },
        },
      ],
    }).compile();

    service = module.get<JwtConfigService>(JwtConfigService);
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create JWT options', async () => {
    const options = await service.createJwtOptions();
    expect(options).toEqual({
      signOptions: {
        algorithm: 'PS256',
        expiresIn: '10m',
      },
      publicKey: 'mockPublicKey',
      privateKey: 'mockPrivateKey',
    });
  });

  it('should call exportPublicKey and exportPrivateKey', async () => {
    await service.createJwtOptions();
    expect(cryptoService.exportPublicKey).toHaveBeenCalled();
    expect(cryptoService.exportPrivateKey).toHaveBeenCalled();
  });
});
