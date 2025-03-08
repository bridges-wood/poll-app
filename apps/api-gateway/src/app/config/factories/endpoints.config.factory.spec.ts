import * as fs from 'fs';
import * as yaml from 'js-yaml';
import EndpointsConfigFactory, {
  EndpointsConfig,
} from './endpoints.config.factory';

jest.mock('fs');
jest.mock('js-yaml');

describe('EndpointsConfigFactory', () => {
  const mockConfig: EndpointsConfig = {
    endpoints: [
      {
        name: 'service1',
        hash: 'hash1',
        url: 'http://service1.com',
        description: 'Service 1',
        hasJwks: true,
      },
    ],
  };

  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('mocked yaml content');
    (yaml.load as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should load and validate the configuration', () => {
    const config = EndpointsConfigFactory();
    expect(config).toEqual(mockConfig);
  });

  it('should use default values if optional fields are missing', () => {
    const mockConfig = {
      endpoints: [
        {
          name: 'service2',
          hash: 'hash2',
          url: 'http://service2.com',
        },
      ],
    };

    const expectedConfig: EndpointsConfig = {
      endpoints: [
        {
          name: 'service2',
          hash: 'hash2',
          url: 'http://service2.com',
          hasJwks: false,
        },
      ],
    };

    (fs.readFileSync as jest.Mock).mockReturnValue('mocked yaml content');
    (yaml.load as jest.Mock).mockReturnValue(mockConfig);

    const config = EndpointsConfigFactory();
    expect(config).toEqual(expectedConfig);
  });

  it('should return for a non existing configuration file', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const config = EndpointsConfigFactory();
    expect(config).toEqual({ endpoints: [] });
  });

  it('should return an empty array if the configuration does not contain endpoints', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue('mocked yaml content');
    (yaml.load as jest.Mock).mockReturnValue(undefined);

    const config = EndpointsConfigFactory();
    expect(config).toEqual({ endpoints: [] });
  });

  it('should throw an error if the configuration is invalid', () => {
    const invalidConfig = {
      endpoints: [
        {
          name: 'service3',
          hash: 'hash3',
          url: 123, // Invalid type
        },
      ],
    };

    (fs.readFileSync as jest.Mock).mockReturnValue('mocked yaml content');
    (yaml.load as jest.Mock).mockReturnValue(invalidConfig);

    expect(() => EndpointsConfigFactory()).toThrow();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
