import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { readFileSync } from 'fs';
import { join } from 'path/posix';

export function getHttpsOptions(): HttpsOptions {
  const keyPath = join(__dirname, 'assets/ssl/key.pem');
  const certPath = join(__dirname, 'assets/ssl/cert.pem');

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  };
}
