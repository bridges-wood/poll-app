import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ApplicationInfoManager } from './application-info-manager';
import { DiscoveryClient } from './discovery/discovery-client';
import { InstanceStatus } from './appinfo/instance-info';

@Injectable()
export class RegistrationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(RegistrationService.name);
  private readonly applicationInfoManager: ApplicationInfoManager;
  private readonly discoveryClient: DiscoveryClient;

  constructor(
    private applicationInfoManager: ApplicationInfoManager,
    private discoveryClient: DiscoveryClient
  ) {
    this.applicationInfoManager = applicationInfoManager;
    this.discoveryClient = discoveryClient;
  }

  onApplicationBootstrap() {
    this.logger.log("Registering service with STARTING status")
    this.applicationInfoManager.setInstanceStatus(InstanceStatus.STARTING);

    // TODO - add hook to do startup stuff??

    this.logger.log("Initialization complete; setting status to UP")
    this.applicationInfoManager.setInstanceStatus(InstanceStatus.UP);

  }

  private async registerWithDiscovery() {
    await this.discoveryClient.getNextServerFromEureka()
  }
}
