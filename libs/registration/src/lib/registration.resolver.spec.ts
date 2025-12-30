import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';

jest.mock('jose', () => ({
  exportJWK: jest.fn(),
}));

describe('RegistrationResolver', () => {
  let resolver: RegistrationResolver;
  let service: RegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationResolver,
        {
          provide: RegistrationService,
          useValue: {
            reRegister: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<RegistrationResolver>(RegistrationResolver);
    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('_reRegister', () => {
    it('should call reRegister method of RegistrationService', async () => {
      jest.spyOn(service, 'reRegister').mockResolvedValue(true);
      const result = await resolver._reRegister();
      expect(result).toBe(true);
      expect(service.reRegister).toHaveBeenCalled();
    });

    it('should return false if reRegister method of RegistrationService fails', async () => {
      jest.spyOn(service, 'reRegister').mockResolvedValue(false);
      const result = await resolver._reRegister();
      expect(result).toBe(false);
      expect(service.reRegister).toHaveBeenCalled();
    });
  });
});
