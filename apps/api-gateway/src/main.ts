/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

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

  const port =
    process.env.NODE_ENV === 'development' ? 3000 : Number(process.env.PORT);
  await app.listen(port);
  Logger.log(`🚀 API Gateway is running on: https://localhost:${port}/graphql`);
}

bootstrap();
