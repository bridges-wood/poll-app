import { Inject, Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { InstanceInfo, InstanceStatus } from './appinfo/instance-info';
import { InstanceConfig } from './instance-config';
import { LeaseInfo } from './lease/lease-info';
import { INSTANCE_CONFIG_TOKEN, INSTANCE_INFO_TOKEN } from './tokens';

@Injectable()
export class ApplicationInfoManager {
  private static readonly logger = new Logger(ApplicationInfoManager.name);
  private config: InstanceConfig;
  private instanceInfo: InstanceInfo;

  constructor(
    @Inject(INSTANCE_CONFIG_TOKEN) config: InstanceConfig,
    @Inject(INSTANCE_INFO_TOKEN) instanceInfo: InstanceInfo
  ) {
    this.config = config;
    this.instanceInfo = instanceInfo;
    ApplicationInfoManager.logger.log('ApplicationInfoManager created');
  }

  public setInstanceStatus(status: InstanceStatus): void {
    this.instanceInfo.setStatus(status);
  }

  public refreshLeaseInfoIfRequired(): void {
    const leaseInfo = this.instanceInfo.leaseInfo;
    if (_.isNil(leaseInfo)) {
      return;
    }

    const currentLeaseDuration = this.config.leaseExpirationDurationInSecs;
    const currentLeaseRenewal = this.config.leaseRenewalIntervalInSecs;
    if (
      leaseInfo.durationInSecs !== currentLeaseDuration ||
      leaseInfo.renewalIntervalInSecs !== currentLeaseRenewal
    ) {
      const newLeaseInfo: LeaseInfo = {
        renewalIntervalInSecs: currentLeaseRenewal,
        durationInSecs: currentLeaseDuration,
      };
      this.instanceInfo.leaseInfo = newLeaseInfo;
      this.instanceInfo.setIsDirty();
    }
  }

  public getInfo(): InstanceInfo {
    return this.instanceInfo;
  }
}
