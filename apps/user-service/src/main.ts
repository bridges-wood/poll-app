/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@org/config';
import { RegistrationService } from '@org/registration';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);
  const registrationService = app.get(RegistrationService);

  const port = configService.port;
  await app.listen(port);
  Logger.log(`🚀 User Service is running on: http://localhost:${port}/graphql`);
  await registrationService.afterApplicationBootstrap();
}

bootstrap();
