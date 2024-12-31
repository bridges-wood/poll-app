import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientConfigService } from '@org/config';
import { CrossAppHealthService } from '@org/health';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let crossAppRegistrationService: CrossAppRegistrationService;
  let crossAppHealthService: CrossAppHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: ClientConfigService,
          useValue: {
            name: 'test-service',
            port: 3000,
            hasJwks: true,
          },
        },
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

  it('should register itself', async () => {
    const registerSpy = jest.spyOn(crossAppRegistrationService, 'register');
    await service.registerSelf();
    expect(registerSpy).toHaveBeenCalledWith('test-service', 3000, true);
  });

  it('should skip registration if already locked', async () => {
    jest.spyOn(service['registrationMutex'], 'isLocked').mockReturnValue(true);
    const registerSpy = jest.spyOn(crossAppRegistrationService, 'register');
    await service.registerSelf();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should handle registration failure', async () => {
    jest
      .spyOn(crossAppRegistrationService, 'register')
      .mockResolvedValue({ success: false });
    await expect(service.registerSelf()).rejects.toThrow('Failed to register');
  });

  it('should unregister itself', async () => {
    const unregisterSpy = jest.spyOn(crossAppRegistrationService, 'unregister');
    await service.unregisterSelf();
    expect(unregisterSpy).toHaveBeenCalledWith('test-service');
  });

  it('should skip deregistration if already locked', async () => {
    jest
      .spyOn(service['deregistrationMutex'], 'isLocked')
      .mockReturnValue(true);
    const unregisterSpy = jest.spyOn(crossAppRegistrationService, 'unregister');
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

  it('should re-register itself when requested by the gateway', async () => {
    const registerSelfSpy = jest.spyOn(service, 'registerSelf');
    await service.reRegister();
    expect(registerSelfSpy).toHaveBeenCalled();
  });

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
});
