import { Test } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { readdirSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { ConfigService } from './config.service';

jest.mock('fs');
jest.mock('js-yaml');

describe('ConfigService', () => {
  const oldEnv = { ...process.env };
  let logger: BaseLogger;
  let service: ConfigService;

  beforeEach(async () => {
    setupEnvironment();
    setupFsMocks();

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        ConfigService,
      ],
    }).compile();

    logger = module.get<BaseLogger>(BaseLogger);
    service = module.get<ConfigService>(ConfigService);
  });

  function setupEnvironment() {
    process.env['PORT'] = '3000';
    process.env['HMAC_SECRET'] = 'test';
  }

  function setupFsMocks() {
    (readdirSync as jest.Mock).mockReturnValue([]);
    (readFileSync as jest.Mock).mockReturnValue('');
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadDefaultQueries', () => {
    it('should load queries from files', () => {
      const mockFiles = ['query1.gql', 'query2.graphql'];
      const mockContent = 'query { test }';
      (readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (readFileSync as jest.Mock).mockReturnValue(mockContent);

      service['loadDefaultQueries']();

      expect(service.getQueries()).toEqual([mockContent, mockContent]);
    });

    it('should recover gracefully from query files that cannot be read', () => {
      const mockFiles = ['query1.gql', 'query2.graphql'];
      (readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Cannot read file');
      });

      expect(() => service['loadDefaultQueries']()).not.toThrow();
    });
  });

  describe('loadConfigFromFile', () => {
    it('should load config from file', () => {
      const mockConfig = {
        endpoints: [
          { name: 'test', hash: 'test-hash', url: 'http://test.com' },
        ],
      };
      (readFileSync as jest.Mock).mockReturnValue('mocked-content');
      (yaml.load as jest.Mock).mockReturnValue(mockConfig);

      service['loadConfigFromFile']();

      expect(service.getEndpoints()).toEqual([
        {
          ...mockConfig.endpoints[0],
          hasJwks: false,
        },
      ]);
    });

    it('should log an error if config file is invalid', () => {
      (readFileSync as jest.Mock).mockReturnValue('invalid content');
      (yaml.load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML');
      });
      (logger.error as jest.Mock) = jest.fn();

      service['loadConfigFromFile']();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('loadConfigFromEnv', () => {
    it('should load config from environment variables', () => {
      process.env.SVC_CONNECT_SERVICE_HOST_1 = 'localhost';
      process.env.SVC_CONNECT_SERVICE_PORT_1 = '3000';

      service['loadConfigFromEnv']();

      expect(service.getEndpoints()).toEqual([
        {
          name: 'svc_connect_service_host_1',
          hash: expect.any(String),
          url: 'https://localhost:3000/graphql',
          hasJwks: false,
        },
      ]);
    });

    it('should recover gracefully from invalid endpoint configuration', () => {
      process.env.SVC_CONNECT_SERVICE_HOST_1 = 'localhost';

      expect(() => service['loadConfigFromEnv']()).not.toThrow();
    });

    it('should recover gracefully if no endpoints are found', () => {
      expect(() => service['loadConfigFromEnv']()).not.toThrow();
    });
  });

  afterEach(() => {
    process.env = { ...oldEnv };
    jest.resetAllMocks();
  });
});
