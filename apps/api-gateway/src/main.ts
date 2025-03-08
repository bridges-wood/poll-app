/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    httpsOptions: {
      key: readFileSync(join(__dirname, 'assets/ssl/key.pem')),
      cert: readFileSync(join(__dirname, 'assets/ssl/cert.pem')),
    },
  });
  app.enableShutdownHooks();

  const { port }: EnvironmentConfig = app.get(EnvironmentConfigFactory.KEY);
  if (!port) throw new Error('Port is not defined');

  await app.listen(port);
  Logger.log(`🚀 API Gateway is running on: https://localhost:${port}/graphql`);
}

bootstrap();
