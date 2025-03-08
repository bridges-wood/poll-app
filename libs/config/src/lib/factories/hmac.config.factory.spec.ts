import hmacConfigFactory, { hmacValidator } from './hmac.config.factory';

describe('hmacConfigFactory', () => {
  const environment = { ...process.env };

  it('should load the configuration', () => {
    const config = hmacConfigFactory();

    expect(config).toEqual({
      secret: 'secret',
    });
  });

  afterEach(() => {
    process.env = environment;
  });
});

describe('hmacValidator', () => {
  it('should return complete config for valid input', () => {
    const result = hmacValidator.parse({
      HMAC_SECRET: 'secret',
    });

    expect(result).toEqual({
      HMAC_SECRET: 'secret',
    });
  });

  it('should throw an error for empty secret', () => {
    expect(() =>
      hmacValidator.parse({
        HMAC_SECRET: '',
      }),
    ).toThrow();
  });
});
