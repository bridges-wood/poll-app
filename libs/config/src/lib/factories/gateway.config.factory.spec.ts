import gatewayConfigFactory, {
  GatewayConfigValidator,
} from './gateway.config.factory';

describe('gatewayConfigFactory', () => {
  const environment = { ...process.env };

  it('should load the configuration', () => {
    const config = gatewayConfigFactory();

    expect(config).toEqual({
      url: 'https://localhost:1234/graphql',
    });
  });

  it('should use the port in development, if it is set', () => {
    process.env['NODE_ENV'] = 'development';
    const config = gatewayConfigFactory();

    expect(config).toEqual({
      url: 'https://localhost:1234/graphql',
    });
  });

  it('should default to port 3000 in development, if it is not set', () => {
    process.env['NODE_ENV'] = 'development';
    delete process.env['API_GATEWAY_SERVICE_PORT'];
    const config = gatewayConfigFactory();

    expect(config).toEqual({
      url: 'https://localhost:3000/graphql',
    });
  });

  afterEach(() => {
    process.env = environment;
  });
});

describe('gatewayValidator', () => {
  it('should return complete config for valid input', () => {
    const result = GatewayConfigValidator.parse({
      NODE_ENV: 'development',
      API_GATEWAY_SERVICE_PORT: '3000',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
      API_GATEWAY_SERVICE_PORT: '3000',
    });
  });

  it('should return complete config for valid input with optional field', () => {
    const result = GatewayConfigValidator.parse({
      NODE_ENV: 'development',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('should throw an error for missing port in production', () => {
    expect(() =>
      GatewayConfigValidator.parse({
        NODE_ENV: 'production',
      }),
    ).toThrow();
  });
});
