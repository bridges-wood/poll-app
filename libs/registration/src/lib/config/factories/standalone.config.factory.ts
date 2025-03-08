import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { RegistrationConfigTokens } from '../tokens';

export const StandaloneConfigValidator = z.object({
  STANDALONE_MODE: z.union([z.literal('true'), z.literal('false')]).optional(),
});

const StandaloneConfigFactory = registerAs(
  RegistrationConfigTokens.STANDALONE,
  () => {
    const env = StandaloneConfigValidator.parse(process.env);

    return {
      standalone: env['STANDALONE_MODE'] === 'true',
    };
  },
);

export type StandaloneConfig = ConfigType<typeof StandaloneConfigFactory>;

export default StandaloneConfigFactory;
