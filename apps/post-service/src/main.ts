/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port =
    process.env.NODE_ENV === 'development' ? 3002 : Number(process.env.PORT);
  await app.listen(port);
  Logger.log(`🚀 Post Service is running on: http://localhost:${port}/graphql`);
}

bootstrap();
