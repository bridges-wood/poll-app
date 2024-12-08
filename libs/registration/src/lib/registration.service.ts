import { BeforeApplicationShutdown, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@org/config';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';

@Injectable()
export class RegistrationService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(RegistrationService.name);
  constructor(
    private configService: ConfigService,
    private readonly crossAppRegistrationService: CrossAppRegistrationService,
  ) {}

  async afterApplicationBootstrap() {
    try {
      await this.registerSelf();
    } catch (error) {
      this.logger.error(`Error during application bootstrap: ${error}`);
    }
  }

  async registerSelf(): Promise<void> {
    this.logger.log(
      `📡 Attempting to register ${this.configService.name} with the gateway...`,
    );
    const success = await this.crossAppRegistrationService.register(
      this.configService.name,
      this.configService.port,
    );

    if (success) {
      this.logger.log(
        `✅ Successfully registered ${this.configService.name} with the gateway`,
      );
    } else throw new Error('Failed to register');
  }

  async beforeApplicationShutdown(_signal?: string | undefined) {
    try {
      await this.unregisterSelf();
    } catch (error) {
      this.logger.error(`Error during application shutdown: ${error}`);
    }
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
}
