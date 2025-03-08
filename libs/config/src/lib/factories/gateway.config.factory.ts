import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { ConfigTokens } from '../tokens';

export const GatewayConfigValidator = z
  .object({
    NODE_ENV: z.union([
      z.literal('development'),
      z.literal('production'),
      z.literal('test'),
    ]),
    API_GATEWAY_SERVICE_PORT: z.string().optional(),
  })
  .refine(
    (input) =>
      input.NODE_ENV !== 'production' || !!input.API_GATEWAY_SERVICE_PORT,
    { message: 'API_GATEWAY_SERVICE_PORT must be set in production' },
  );

const GatewayConfigFactory = registerAs(ConfigTokens.GATEWAY, () => {
  const env = GatewayConfigValidator.parse(process.env);

  if (env['NODE_ENV'] === 'development' && !env['API_GATEWAY_SERVICE_PORT']) {
    return { url: 'https://localhost:3000/graphql' };
  } else {
    return {
      url: `https://localhost:${env['API_GATEWAY_SERVICE_PORT']}/graphql`,
    };
  }
});

export type GatewayConfig = ConfigType<typeof GatewayConfigFactory>;

export default GatewayConfigFactory;
