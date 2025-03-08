import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Cron, CronExpression } from '@nestjs/schedule';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import { CryptoService } from '@org/crypto';
import { CrossAppHealthService } from '@org/health';
import { BaseLogger } from '@org/log';
import assert from 'assert';
import { Mutex } from 'async-mutex';
import StandaloneConfigFactory, {
  StandaloneConfig,
} from './config/factories/standalone.config.factory';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';

@Injectable()
export class RegistrationService implements BeforeApplicationShutdown {
  private registrationMutex: Mutex;
  private deregistrationMutex: Mutex;
  private hasJwks: boolean;

  constructor(
    @Inject(EnvironmentConfigFactory.KEY)
    private readonly environmentConfig: EnvironmentConfig,
    @Inject(StandaloneConfigFactory.KEY)
    private readonly standaloneConfig: StandaloneConfig,
    private readonly crossAppRegistrationService: CrossAppRegistrationService,
    private readonly crossAppHealthService: CrossAppHealthService,
    private readonly logger: BaseLogger,
    moduleRef: ModuleRef,
  ) {
    this.logger.setContext(RegistrationService.name);
    this.registrationMutex = new Mutex();
    this.deregistrationMutex = new Mutex();

    try {
      moduleRef.get(CryptoService, { strict: false }); // Throws if not found
      this.hasJwks = true;
      this.logger.debug('CryptoService found, enabling JWKS registration');
    } catch (error) {
      this.logger.debug(
        'CryptoService not found, skipping JWKS registration',
        error,
      );
      this.hasJwks = false;
    }
  }

  async afterApplicationBootstrap() {
    if (this.standaloneConfig.standalone) {
      this.logger.log('🚀 Running in standalone mode, skipping registration');
      return;
    }
    try {
      await this.registerSelf();
    } catch (error) {
      this.logger.error(`Error during application bootstrap: ${error}`);
    }
  }

  async beforeApplicationShutdown(_signal?: string | undefined) {
    try {
      await this.unregisterSelf();
    } catch (error) {
      this.logger.error(`Error during application shutdown: ${error}`);
    }
  }

  async registerSelf(): Promise<void> {
    if (this.registrationMutex.isLocked()) return;
    this.logger.log(
      `📡 Attempting to register ${this.environmentConfig.name} with the gateway...`,
    );

    const response = await this.registrationMutex.runExclusive(async () => {
      assert(
        this.environmentConfig.port,
        'Port must be set before registering',
      );

      return this.crossAppRegistrationService.register(
        this.environmentConfig.name,
        this.environmentConfig.port,
        this.hasJwks,
      );
    });

    if (response.success) {
      this.logger.log(
        `✅ Successfully registered ${this.environmentConfig.name} with the gateway`,
      );
    } else {
      throw new Error('Failed to register');
    }
  }

  async unregisterSelf(): Promise<void> {
    if (this.deregistrationMutex.isLocked()) return;
    this.logger.log(
      `📡 Attempting to de-register ${this.environmentConfig.name} with the gateway...`,
    );

    const success = await this.deregistrationMutex.runExclusive(async () =>
      this.crossAppRegistrationService.unregister(this.environmentConfig.name),
    );

    if (success) {
      this.logger.log(
        `✅ Successfully de-registered ${this.environmentConfig.name}`,
      );
    } else {
      throw new Error('Failed to unregister');
    }
  }

  /**
   * Disconnects the service from the gateway. Re-initiates the registration process. Called by the gateway.
   */
  async reRegister(): Promise<boolean> {
    this.logger.log(
      `📡 Gateway requested ${this.environmentConfig.name} to re-register`,
    );
    this.registerSelf();
    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async checkIn() {
    if (this.standaloneConfig.standalone) {
      this.logger.log('🚀 Running in standalone mode, skipping check-in');
      return;
    }

    this.logger.log(`🤖 Checking in with the gateway...`);
    try {
      await this.crossAppHealthService.checkIn();
      this.logger.log(`🦾 Successfully checked in with the gateway`);
    } catch (error) {
      this.logger.error(
        `❗️ Failed to check in with the gateway, reason: ${error}`,
      );
      return this.registerSelf();
    }
  }
}
