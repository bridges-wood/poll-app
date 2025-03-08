import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({
  path: resolve(process.cwd(), 'libs', 'auth', '.env.test'),
});
