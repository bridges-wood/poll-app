import environmentConfigFactory, {
  EnvironmentConfigValidator,
} from './environment.config.factory';

describe('environmentConfigFactory', () => {
  const environment = { ...process.env };

  it('should load the configuration', () => {
    const config = environmentConfigFactory();

    expect(config).toEqual({
      environment: 'test',
      isDev: expect.any(Function),
      name: 'service',
      setPort: expect.any(Function),
      port: 3001,
    });
  });

  it('should default port to NaN if not set', () => {
    delete process.env['PORT'];
    const config = environmentConfigFactory();

    expect(config).toEqual({
      environment: 'test',
      isDev: expect.any(Function),
      name: 'service',
      port: undefined,
      setPort: expect.any(Function),
    });
  });

  afterEach(() => {
    process.env = environment;
  });
});

describe('environmentValidator', () => {
  it('should return complete config for valid input', () => {
    const result = EnvironmentConfigValidator.parse({
      NODE_ENV: 'development',
      PORT: '3000',
      NAME: 'service',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: '3000',
      NAME: 'service',
    });
  });

  it('should return complete config for valid input with optional field', () => {
    const result = EnvironmentConfigValidator.parse({
      NODE_ENV: 'development',
      NAME: 'service',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
      NAME: 'service',
    });
  });

  it('should throw an error if NODE_ENV is production and PORT is not set', () => {
    expect(() =>
      EnvironmentConfigValidator.parse({
        NODE_ENV: 'production',
        NAME: 'service',
      }),
    ).toThrow();
  });
});
