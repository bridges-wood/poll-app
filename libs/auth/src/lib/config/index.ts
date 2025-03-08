import { ConfigType } from '@nestjs/config';

import authConfig from './auth.config.factory';

export * from './auth.config.factory';

export const AuthConfigFactory = authConfig;

export type AuthConfig = ConfigType<typeof authConfig>;
