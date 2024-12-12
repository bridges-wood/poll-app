import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClientConfigService } from '@org/config';
import { RegistrationService } from '@org/registration';
import { readFileSync } from 'fs';
import { isUndefined, range, sample } from 'lodash';
import { join } from 'path';

export async function bootstrap(appModule: unknown, appName: string) {
  const app = await NestFactory.create(appModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    httpsOptions: {
      key: readFileSync(join(__dirname, 'assets/ssl/key.pem')),
      cert: readFileSync(join(__dirname, 'assets/ssl/cert.pem')),
    },
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

async function findAndListenOnPort(
  app: INestApplication<unknown>,
  start: number,
  end: number,
): Promise<number> {
  // Create a set of candidate ports from start to end
  const candidatePorts = new Set<number>(range(start, end + 1));

  let port: number;
  while (candidatePorts.size > 0) {
    port = sample(Array.from(candidatePorts));
    try {
      await app.listen(port);
      break;
    } catch {
      Logger.debug(`Port ${port} is in use, trying next port...`);
      candidatePorts.delete(port);
    }
  }

  if (candidatePorts.size === 0) {
    throw new Error(`No available ports in range ${start}-${end}`);
  } else {
    return port;
  }
}
