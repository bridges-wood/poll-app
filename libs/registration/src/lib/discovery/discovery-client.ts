import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import _ from 'lodash';
import { InstanceInfo, InstanceStatus } from '../appinfo/instance-info';
import { ApplicationInfoManager } from '../application-info-manager';
import {
  InstanceInfoBasedUrlRandomizer,
  ServiceUrlRandomizer,
} from '../endpoint/endpoint-utils';
import Application from '../shared/application';
import { LookupService } from '../shared/lookup-service';
import { ClientConfig } from './client-config';

@Injectable()
export class DiscoveryClient implements LookupService {
  private readonly logger: Logger = new Logger(DiscoveryClient.name);

  // Timers
  private readonly FETCH_REGISTRY_TIMER = 'fetchRegistry';
  private readonly HEARTBEAT_TIMER = 'heartbeat';

  // Instance variables
  private readonly applicationInfoManager: ApplicationInfoManager;
  private readonly instanceInfo: InstanceInfo;
  private readonly schedulerRegistry: SchedulerRegistry;
  private readonly urlRandomizer: ServiceUrlRandomizer;

  protected readonly clientConfig: ClientConfig;

  private lastRemoteInstanceStatus: InstanceStatus = InstanceStatus.UNKNOWN;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private applicationInfoManager: ApplicationInfoManager,
    private config: ClientConfig
  ) {
    this.applicationInfoManager = applicationInfoManager;
    this.instanceInfo = applicationInfoManager.getInfo();
    this.clientConfig = config;
    this.urlRandomizer = new InstanceInfoBasedUrlRandomizer(this.instanceInfo);

    this.fetchRegistry();
    this.register();
    this.initialiseScheduledTasks();

    this.logger.log('Initialized discovery client');
  }

  private fetchRegistry(forceFullRegistryRefresh?: false): boolean {
    try {
      this.getAndStoreFullRegistry();
    } catch (error) {
      this.logger.error('DiscoveryClient: failed to update registry', error);
      return false;
    }
    
    this.updateInstanceRemoteStatus();
    return true;
  }

  private getAndStoreFullRegistry(): void {
    
  }


  private updateInstanceRemoteStatus(): void {
    let currentRemoteInstanceStatus = null;
    if (!_.isNil(this.instanceInfo.appName)) {
      const app = this.getApplication(this.instanceInfo.appName);
      if (!_.isNil(app)) {
        const remoteInstance = app.getInstanceById(this.instanceInfo.id);
        if (!_.isNil(remoteInstance)) {
          currentRemoteInstanceStatus = remoteInstance.status;
        }
      }
    }

    if (currentRemoteInstanceStatus === null) {
      currentRemoteInstanceStatus = InstanceStatus.UNKNOWN;
    }

    if (this.lastRemoteInstanceStatus !== currentRemoteInstanceStatus) {
      this.lastRemoteInstanceStatus = currentRemoteInstanceStatus;
    }
  }

  getApplication(appName: string): Application | null {
    throw new Error('Method not implemented.');
  }
  getApplications(): Application[] {
    throw new Error('Method not implemented.');
  }
  getNextServerFromEureka(
    appName: string,
    secure: boolean
  ): InstanceInfo | null {
    throw new Error('Method not implemented.');
  }

  public shutdown(): void {}
}
