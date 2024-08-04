import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@org/config';
import { CrossAppRegistrationService } from './cross-app/cross-app.registration.service';

@Injectable()
export class RegistrationService implements OnApplicationShutdown {
  private readonly logger = new Logger(RegistrationService.name);
  constructor(
    private configService: ConfigService,
    private readonly crossAppRegistrationService: CrossAppRegistrationService,
  ) {}

  async onApplicationShutdown(signal?: string | undefined) {
    const success = await this.crossAppRegistrationService.unregister(
      this.configService.name,
    );

    if (success) {
      this.logger.log(`Successfully unregistered ${this.configService.name}`);
    } else {
      this.logger.error(`Failed to unregister ${this.configService.name}`);
    }
  }

  async registerSelf(): Promise<void> {
    try {
      const success = await this.crossAppRegistrationService.register(
        this.configService.name,
        this.configService.port,
      );

      if (success) {
        this.logger.log(`Successfully registered ${this.configService.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to register ${this.configService.name}`);
    }
  }
}
