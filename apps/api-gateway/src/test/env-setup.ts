import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({
  path: resolve(process.cwd(), 'apps', 'api-gateway', '.env.test'),
});
