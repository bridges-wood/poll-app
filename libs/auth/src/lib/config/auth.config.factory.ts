import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { AuthConfigTokens } from '../tokens';

export const AuthConfigValidator = z.object({
  NO_AUTH: z.union([z.literal('true'), z.literal('false')]).optional(),
});

export default registerAs(AuthConfigTokens.AUTH, () => {
  const env = AuthConfigValidator.parse(process.env);

  return {
    bypassAuth: env['NO_AUTH'] === 'true',
  };
});
