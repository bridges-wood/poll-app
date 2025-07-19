import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import { RegistrationService } from '@org/registration';
import { when } from 'jest-when';
import { bootstrap } from './index';

jest.mock('@nestjs/core', () => {
  const actual = jest.requireActual('@nestjs/core');

  return {
    ...actual,
    NestFactory: {
      create: jest.fn().mockResolvedValue({
        enableShutdownHooks: jest.fn(),
        get: jest.fn(),
        listen: jest.fn(),
      }),
    },
  };
});

jest.mock('./helpers/get-https-options', () => ({
  getHttpsOptions: jest.fn().mockReturnValue({}),
}));

class MockModule {
  constructor() {
    // Mock implementation if needed
  }
}

describe('Bootstrap', () => {
  let appModule: INestApplication;
  let environmentConfig: EnvironmentConfig;
  let registrationService: RegistrationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EnvironmentConfigFactory.KEY,
          useValue: {
            get port() {
              return 3000;
            },
            setPort: jest.fn(),
          },
        },
        {
          provide: RegistrationService,
          useValue: {
            afterApplicationBootstrap: jest.fn(),
          },
        },
      ],
    }).compile();

    appModule = moduleFixture.createNestApplication();
    appModule.listen = jest.fn();

    environmentConfig = moduleFixture.get<EnvironmentConfig>(
      EnvironmentConfigFactory.KEY,
    );
    registrationService =
      moduleFixture.get<RegistrationService>(RegistrationService);

    jest
      .spyOn(registrationService, 'afterApplicationBootstrap')
      .mockResolvedValueOnce();

    NestFactory.create = jest.fn().mockResolvedValue(appModule);
  });

  it('should bootstrap the application with a specified port', async () => {
    await bootstrap(MockModule, 'TestApp');
    expect(appModule.listen).toHaveBeenCalledWith(3000);

    expect(registrationService.afterApplicationBootstrap).toHaveBeenCalled();
  });

  it('should find and listen on an available port if none is specified', async () => {
    jest.spyOn(environmentConfig, 'port', 'get').mockReturnValue(undefined);
    when(jest.spyOn(appModule, 'listen'))
      .calledWith(when.allArgs((args, equals) => equals(args[0], 4500)))
      .mockResolvedValueOnce(true)
      .defaultRejectedValue(new Error('Port in use'));

    await bootstrap(MockModule, 'TestApp');
    expect(appModule.listen).toHaveBeenCalledWith(4500);
    expect(environmentConfig.setPort).toHaveBeenCalledWith(4500);
    expect(registrationService.afterApplicationBootstrap).toHaveBeenCalled();
  });

  it('should throw an error if no ports are available', async () => {
    jest.spyOn(environmentConfig, 'port', 'get').mockReturnValue(undefined);
    jest.spyOn(appModule, 'listen').mockImplementation(async () => {
      throw new Error('Port in use');
    });

    await expect(bootstrap(MockModule, 'TestApp')).rejects.toThrow(
      'No available ports in range 4000-5000',
    );
  });
});
