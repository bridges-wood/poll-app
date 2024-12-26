import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientConfigService } from '@org/config';
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

describe('Bootstrap', () => {
  let appModule: INestApplication;
  let clientConfigService: ClientConfigService;
  let registrationService: RegistrationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ClientConfigService,
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

    clientConfigService =
      moduleFixture.get<ClientConfigService>(ClientConfigService);
    registrationService =
      moduleFixture.get<RegistrationService>(RegistrationService);

    jest
      .spyOn(registrationService, 'afterApplicationBootstrap')
      .mockResolvedValueOnce();

    NestFactory.create = jest.fn().mockResolvedValue(appModule);
  });

  it('should bootstrap the application with a specified port', async () => {
    await bootstrap({}, 'TestApp');
    expect(appModule.listen).toHaveBeenCalledWith(3000);

    expect(registrationService.afterApplicationBootstrap).toHaveBeenCalled();
  });

  it('should find and listen on an available port if none is specified', async () => {
    jest.spyOn(clientConfigService, 'port', 'get').mockReturnValue(undefined);
    when(jest.spyOn(appModule, 'listen'))
      .calledWith(when.allArgs((args, equals) => equals(args[0], 4500)))
      .mockResolvedValueOnce(true)
      .defaultRejectedValue(new Error('Port in use'));

    await bootstrap({}, 'TestApp');
    expect(appModule.listen).toHaveBeenCalledWith(4500);
    expect(clientConfigService.setPort).toHaveBeenCalledWith(4500);
    expect(registrationService.afterApplicationBootstrap).toHaveBeenCalled();
  });

  it('should throw an error if no ports are available', async () => {
    jest.spyOn(clientConfigService, 'port', 'get').mockReturnValue(undefined);
    jest.spyOn(appModule, 'listen').mockImplementation(async () => {
      throw new Error('Port in use');
    });

    await expect(bootstrap({}, 'TestApp')).rejects.toThrow(
      'No available ports in range 4000-5000',
    );
  });
});
