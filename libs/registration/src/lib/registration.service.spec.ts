import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';
import { CryptoService } from '@org/crypto';
import { CrossAppHealthService } from '@org/health';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import StandaloneConfigFactory from './config/factories/standalone.config.factory';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';
import { RegistrationService } from './registration.service';

jest.mock('jose', () => ({
  exportJWK: jest.fn(),
}));

describe('RegistrationService', () => {
  let service: RegistrationService;
  let crossAppRegistrationService: CrossAppRegistrationService;
  let crossAppHealthService: CrossAppHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(EnvironmentConfigFactory),
        ConfigModule.forFeature(StandaloneConfigFactory),
      ],
      providers: [
        {
          provide: CryptoService,
          useValue: {},
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        RegistrationService,
        {
          provide: CrossAppRegistrationService,
          useValue: {
            register: jest.fn().mockResolvedValue({ success: true }),
            unregister: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: CrossAppHealthService,
          useValue: {
            checkIn: jest.fn().mockResolvedValue(true),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    crossAppRegistrationService = module.get<CrossAppRegistrationService>(
      CrossAppRegistrationService,
    );
    crossAppHealthService = module.get<CrossAppHealthService>(
      CrossAppHealthService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set hasJwks to false if CryptoService is not found', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(EnvironmentConfigFactory),
        ConfigModule.forFeature(StandaloneConfigFactory),
      ],
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        RegistrationService,
        {
          provide: CrossAppRegistrationService,
          useValue: {
            register: jest.fn().mockResolvedValue({ success: true }),
            unregister: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: CrossAppHealthService,
          useValue: {
            checkIn: jest.fn().mockResolvedValue(true),
          },
        },
        Logger,
      ],
    }).compile();

    const service = module.get<RegistrationService>(RegistrationService);
    expect(service['hasJwks']).toBe(false);
  });

  describe('afterApplicationBootstrap', () => {
    it('should skip registration if running in standalone mode', async () => {
      service['standaloneConfig'].standalone = true;
      const registerSelfSpy = jest.spyOn(service, 'registerSelf');
      await service.afterApplicationBootstrap();
      expect(registerSelfSpy).not.toHaveBeenCalled();
    });

    it('should register itself after application bootstrap', async () => {
      const registerSelfSpy = jest.spyOn(service, 'registerSelf');
      await service.afterApplicationBootstrap();
      expect(registerSelfSpy).toHaveBeenCalled();
    });

    it('should handle registration failure during application bootstrap', async () => {
      jest
        .spyOn(service, 'registerSelf')
        .mockRejectedValue(new Error('Registration failed'));

      await expect(service.afterApplicationBootstrap()).resolves.not.toThrow();
    });
  });

  describe('beforeApplicationShutdown', () => {
    it('should unregister itself before application shutdown', async () => {
      const unregisterSelfSpy = jest.spyOn(service, 'unregisterSelf');
      await service.beforeApplicationShutdown();
      expect(unregisterSelfSpy).toHaveBeenCalled();
    });

    it('should handle deregistration failure during application shutdown', async () => {
      jest
        .spyOn(service, 'unregisterSelf')
        .mockRejectedValue(new Error('Deregistration failed'));

      await expect(service.beforeApplicationShutdown()).resolves.not.toThrow();
    });
  });

  describe('registerSelf', () => {
    it('should register itself', async () => {
      const registerSpy = jest.spyOn(crossAppRegistrationService, 'register');
      await service.registerSelf();
      expect(registerSpy).toHaveBeenCalledWith('test-service', 3000, true);
    });

    it('should skip registration if already locked', async () => {
      jest
        .spyOn(service['registrationMutex'], 'isLocked')
        .mockReturnValue(true);
      const registerSpy = jest.spyOn(crossAppRegistrationService, 'register');
      await service.registerSelf();
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it('should handle registration failure', async () => {
      jest
        .spyOn(crossAppRegistrationService, 'register')
        .mockResolvedValue({ success: false });
      await expect(service.registerSelf()).rejects.toThrow(
        'Failed to register',
      );
    });
  });

  describe('unregisterSelf', () => {
    it('should unregister itself', async () => {
      const unregisterSpy = jest.spyOn(
        crossAppRegistrationService,
        'unregister',
      );
      await service.unregisterSelf();
      expect(unregisterSpy).toHaveBeenCalledWith('test-service');
    });

    it('should skip deregistration if already locked', async () => {
      jest
        .spyOn(service['deregistrationMutex'], 'isLocked')
        .mockReturnValue(true);
      const unregisterSpy = jest.spyOn(
        crossAppRegistrationService,
        'unregister',
      );
      await service.unregisterSelf();
      expect(unregisterSpy).not.toHaveBeenCalled();
    });

    it('should handle deregistration failure', async () => {
      jest
        .spyOn(crossAppRegistrationService, 'unregister')
        .mockResolvedValue(false);
      await expect(service.unregisterSelf()).rejects.toThrow(
        'Failed to unregister',
      );
    });
  });

  describe('reRegister', () => {
    it('should re-register itself when requested by the gateway', async () => {
      const registerSelfSpy = jest.spyOn(service, 'registerSelf');
      await service.reRegister();
      expect(registerSelfSpy).toHaveBeenCalled();
    });
  });

  describe('checkIn', () => {
    it('should check in with the gateway', async () => {
      const checkInSpy = jest.spyOn(crossAppHealthService, 'checkIn');
      await service['checkIn']();
      expect(checkInSpy).toHaveBeenCalled();
    });

    it('should handle check-in failure by re-registering', async () => {
      jest
        .spyOn(crossAppHealthService, 'checkIn')
        .mockRejectedValue(new Error('Check-in failed'));
      const registerSelfSpy = jest.spyOn(service, 'registerSelf');
      await service['checkIn']();
      expect(registerSelfSpy).toHaveBeenCalled();
    });

    it('should skip check-in if in standalone mode', async () => {
      service['standaloneConfig'].standalone = true;
      const checkInSpy = jest.spyOn(crossAppHealthService, 'checkIn');
      await service['checkIn']();
      expect(checkInSpy).not.toHaveBeenCalled();
    });
  });
});
