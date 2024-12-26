import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClientConfigService } from '@org/config';
import { RegistrationService } from '@org/registration';
import { isUndefined } from 'lodash';
import { findAndListenOnPort, getHttpsOptions } from './helpers';

export async function bootstrap(appModule: unknown, appName: string) {
  const app = await NestFactory.create(appModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    httpsOptions: getHttpsOptions(),
  });
  app.enableShutdownHooks();
  const registrationService = app.get(RegistrationService);
  const configService = app.get(ClientConfigService);

  let port = configService.port;
  if (isUndefined(configService.port)) {
    // Only look for a port if one is not already set
    port = await findAndListenOnPort(app, 4000, 5000);
    configService.setPort(port);
  } else {
    await app.listen(configService.port);
  }

  Logger.log(`🚀 ${appName} is running on: https://localhost:${port}/graphql`);
  await registrationService.afterApplicationBootstrap();
}
