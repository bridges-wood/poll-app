import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
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
  const environmentConfig: EnvironmentConfig = app.get(
    EnvironmentConfigFactory.KEY,
  );

  let port = environmentConfig.port;
  if (isUndefined(environmentConfig.port)) {
    // Only look for a port if one is not already set
    port = await findAndListenOnPort(app, 4000, 5000);
    environmentConfig.setPort(port);
  } else {
    await app.listen(environmentConfig.port);
  }

  Logger.log(`🚀 ${appName} is running on: https://localhost:${port}/graphql`);
  await registrationService.afterApplicationBootstrap();
}
