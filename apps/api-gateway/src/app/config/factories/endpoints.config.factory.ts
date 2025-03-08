import { ConfigType, registerAs } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { z } from 'zod';
import { GatewayConfigTokens } from '../tokens';

export const EndpointsConfigValidator = z
  .object({
    endpoints: z
      .array(
        z.object({
          name: z.string(),
          hash: z.string(),
          url: z.string(),
          description: z.string().optional(),
          hasJwks: z.boolean().optional().default(false),
        }),
      )
      .default([]),
  })
  .optional();

const EndpointsConfigFactory = registerAs(GatewayConfigTokens.ENDPOINTS, () => {
  const configPath = join(
    __dirname,
    process.env.CONFIG_PATH || 'assets/config.yml',
  );
  if (!existsSync(configPath)) return { endpoints: [] };

  const configFile = readFileSync(configPath, 'utf8');
  const loadedConfig = EndpointsConfigValidator.parse(yaml.load(configFile));
  return {
    endpoints: loadedConfig?.endpoints || [],
  };
});

export type EndpointsConfig = ConfigType<typeof EndpointsConfigFactory>;

export default EndpointsConfigFactory;
