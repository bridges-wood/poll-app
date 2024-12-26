import { GatewayUrlProvider } from './gateway-url.provider';

describe('GatewayUrlProvider', () => {
  it('should provide the development URL when NODE_ENV is development', async () => {
    process.env['NODE_ENV'] = 'development';
    const url = await GatewayUrlProvider.useFactory();
    expect(url).toBe('https://localhost:3000/graphql');
  });

  it('should provide the production URL when NODE_ENV is not development', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['API_GATEWAY_SERVICE_PORT'] = '4000';
    const url = await GatewayUrlProvider.useFactory();
    expect(url).toBe('https://localhost:4000/graphql');
  });

  it('should provide the default URL when API_GATEWAY_SERVICE_PORT is not set', async () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['API_GATEWAY_SERVICE_PORT'];
    const url = await GatewayUrlProvider.useFactory();
    expect(url).toBe('https://localhost:undefined/graphql');
  });
});
