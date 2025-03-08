import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { ConfigTokens } from '../tokens';

export const hmacValidator = z.object({
  HMAC_SECRET: z.string().nonempty(),
});

const HmacConfigFactory = registerAs(ConfigTokens.HMAC, () => ({
  secret: process.env['HMAC_SECRET'] as string,
}));

export type HmacConfig = ConfigType<typeof HmacConfigFactory>;

export default HmacConfigFactory;
