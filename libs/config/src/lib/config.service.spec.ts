import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { join } from 'path';
import { BaseConfigService } from './config.service';

class TestConfigService extends BaseConfigService {}

describe('BaseConfigService', () => {
  let service: TestConfigService;

  beforeEach(async () => {
    setupEnvironment();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        TestConfigService,
      ],
    }).compile();

    service = module.get<TestConfigService>(TestConfigService);
  });

  function setupEnvironment() {
    process.env['PORT'] = '3000';
    process.env['HMAC_SECRET'] = 'test';
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set environment to development by default', () => {
    delete process.env['NODE_ENV'];
    const newService = new TestConfigService(new TestLogger());
    expect(newService.isDev()).toBe(true);
  });

  it('should set environment to production if NODE_ENV is set to production', () => {
    process.env['NODE_ENV'] = 'production';
    const newService = new TestConfigService(new TestLogger());
    expect(newService.isDev()).toBe(false);
  });

  it('should throw an error if HMAC_SECRET is not set', () => {
    delete process.env['HMAC_SECRET'];
    expect(() => new TestConfigService(new TestLogger())).toThrow(
      'HMAC_SECRET must be set',
    );
  });

  it('should set HMAC_SECRET correctly', () => {
    process.env['HMAC_SECRET'] = 'test-secret';
    const newService = new TestConfigService(new TestLogger());
    expect(newService.HMACSecret).toBe('test-secret');
  });

  it('should set schemaFile correctly', () => {
    const expectedPath = join(process.cwd(), 'generated/schema.gql');
    expect(service.schemaFile).toBe(expectedPath);
  });

  it('should set name correctly', () => {
    expect(service.name).toBe('service');
  });

  it('should set port correctly if PORT is set', () => {
    process.env['PORT'] = '3000';
    const newService = new TestConfigService(new TestLogger());
    expect(newService.port).toBe(3000);
  });

  it('should allow the port to be set if it is not already set', () => {
    process.env['PORT'] = undefined;
    const newService = new TestConfigService(new TestLogger());
    newService.setPort(4000);
    expect(newService.port).toBe(4000);
  });

  it('should throw an error if setPort is called when port is already set', () => {
    expect(() => service.setPort(4000)).toThrow('Port is already set');
  });
});
