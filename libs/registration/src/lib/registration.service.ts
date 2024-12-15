import { BeforeApplicationShutdown, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientConfigService } from '@org/config';
import { CrossAppHealthService } from '@org/health';
import assert from 'assert';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';

@Injectable()
export class RegistrationService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(RegistrationService.name);
  constructor(
    private configService: ClientConfigService,
    private readonly crossAppRegistrationService: CrossAppRegistrationService,
    private readonly crossAppHealthService: CrossAppHealthService,
  ) {}

  async afterApplicationBootstrap() {
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
    this.logger.log(
      `📡 Attempting to register ${this.configService.name} with the gateway...`,
    );
    assert(this.configService.port, 'Port must be set before registering');

    const response = await this.crossAppRegistrationService.register(
      this.configService.name,
      this.configService.port,
    );

    if (response.success) {
      this.logger.log(
        `✅ Successfully registered ${this.configService.name} with the gateway`,
      );
    } else throw new Error('Failed to register');
  }

  async unregisterSelf(): Promise<void> {
    this.logger.log(
      `📡 Attempting to de-register ${this.configService.name} with the gateway...`,
    );
    const success = await this.crossAppRegistrationService.unregister(
      this.configService.name,
    );

    if (success) {
      this.logger.log(
        `✅ Successfully de-registered ${this.configService.name}`,
      );
    } else throw new Error('Failed to unregister');
  }

  /**
   * Disconnects the service from the gateway. Re-initiates the registration process. Called by the gateway.
   */
  async reRegister(): Promise<boolean> {
    this.logger.log(
      `📡 Gateway requested ${this.configService.name} to re-register`,
    );
    this.registerSelf();
    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async checkIn() {
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
