import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import _ from 'lodash';
import {
  ActionType,
  InstanceInfo,
  InstanceStatus,
} from '../appinfo/instance-info';
import { Lease } from '../lease/lease';
import {
  DEFAULT_LEASE_DURATION,
  DEFAULT_LEASE_RENEWAL_INTERVAL,
} from '../lease/lease-info';
import { LeaseManager } from '../lease/lease-manager';
import Application from '../shared/application';
import { LookupService } from '../shared/lookup-service';
import {
  DownOrStartingRule,
  FirstMatchWinsCompositeRules,
  LeaseExistsRule,
  OverrideExistsRule,
} from './rule';

@Injectable()
export class InstanceRegistry
  implements LeaseManager<InstanceInfo>, LookupService
{
  private readonly logger = new Logger(InstanceRegistry.name);
  private registry: Map<string, Lease<InstanceInfo>> = new Map();
  private overriddenStatuses: Map<string, InstanceStatus> = new Map();
  private readonly instanceStatusOverrideRule =
    new FirstMatchWinsCompositeRules(
      new DownOrStartingRule(),
      new OverrideExistsRule(this.overriddenStatuses),
      new LeaseExistsRule()
    );

  /**
   * Register a new instance or renew the lease of an existing instance.
   *
   * @param registrant the instance information.
   * @param leaseDuration the lease duration.
   * @param isReplication true if this is a replication event.
   */
  public register(registrant: InstanceInfo, leaseDuration?: number) {
    const existingInstance = this.registry.get(registrant.appName);
    if (!existingInstance) {
      this.registry.set(registrant.appName, undefined);
    }

    const existingLease = this.registry.get(registrant.appName);

    // Retain the last dirty timestamp without overwriting it if there is already a lease
    if (!_.isNil(existingLease) && !_.isNil(existingLease.getHolder())) {
      const existingLastDirtyTimestamp =
        existingLease.getHolder().lastDirtyTimestamp;
      const registrationLastDirtyTimestamp = registrant.lastDirtyTimestamp;
      this.logger.debug(
        `Existing lease found (existing=${existingLastDirtyTimestamp}, registration=${registrationLastDirtyTimestamp})`
      );

      if (existingLastDirtyTimestamp > registrationLastDirtyTimestamp) {
        this.logger.warn(
          "There is an existing lease and the existing lease's dirty timestamp is greater than the registration dirty timestamp"
        );
        this.logger.warn(
          'Using the existing instanceInfo instead of the new instanceInfo'
        );
        registrant = existingLease.getHolder();
      }
    } else {
      this.logger.debug('No existing lease found; it is a new registration');
    }
    const lease = new Lease(registrant, leaseDuration);
    if (!_.isNil(existingLease)) {
      lease.setServiceUpTimestamp(existingLease.getServiceUpTimestamp());
    }
    this.registry.set(registrant.appName, lease);

    // Override the status if needed
    if (registrant.overriddenStatus !== InstanceStatus.UNKNOWN) {
      this.logger.debug(
        `Overridden status ${registrant.overriddenStatus} for app ${registrant.appName}. Checking to see if it needs to be added to the overrides`
      );
      if (!this.overriddenStatuses.has(registrant.appName)) {
        this.logger.log('Not found in the overrides. Adding it now');
        this.overriddenStatuses.set(
          registrant.appName,
          registrant.overriddenStatus
        );
      }
    }

    const overriddenStatusFromMap = this.overriddenStatuses.get(
      registrant.appName
    );
    if (!_.isNil(overriddenStatusFromMap)) {
      this.logger.debug(
        `The instance status is overridden to ${overriddenStatusFromMap}`
      );
      registrant.setOverriddenStatus(overriddenStatusFromMap);
    }

    const overriddenInstanceStatus = this.getOverriddenInstanceStatus(
      registrant,
      existingLease
    );

    // If the lease is registered with UP status, set the service up timestamp
    if (overriddenInstanceStatus === InstanceStatus.UP) {
      lease.serviceUp();
    }
    registrant.actionType = ActionType.ADDED;
    registrant.setLastUpdatedTimestamp();
    this.logger.log(
      `Registered instance ${registrant.appName} with status ${registrant.status})`
    );
  }

  /**
   * Cancel the registration of an instance.
   *
   * <p>
   * This is normally invoked by a client when it shuts down informing the
   * server to remove the instance from traffic.
   * </p>
   *
   * @param appName the application name of the instance.
   * @return true if the instance was removed from the registry successfully, false otherwise.
   */
  public cancel(appName: string) {
    const leaseToCancel = this.registry.get(appName);
    this.registry.delete(appName);

    const instanceStatus = this.overriddenStatuses.get(appName);
    this.overriddenStatuses.delete(appName);
    if (!_.isNil(instanceStatus)) {
      this.logger.debug(
        `Removed instance override status ${instanceStatus} for instance ${appName}`
      );
    }
    if (_.isNil(leaseToCancel)) {
      this.logger.warn(
        `Could not find existing lease for instance ${appName} to cancel`
      );
      return false;
    } else {
      leaseToCancel.cancel();
      const instanceInfo = leaseToCancel.getHolder();
      if (!_.isNil(instanceInfo)) {
        instanceInfo.actionType = ActionType.DELETED;
        instanceInfo.setLastUpdatedTimestamp();
        this.logger.log(
          `Cancelled instance ${instanceInfo.appName} with status ${instanceInfo.status})`
        );
      }
    }

    return true;
  }

  /**
   * Renew the lease of an instance.
   *
   * @param appName the application name of the instance.
   * @return true if the renewal was successful, false otherwise.
   */
  public renew(appName: string) {
    const leaseToRenew = this.registry.get(appName);
    if (_.isNil(leaseToRenew)) {
      this.logger.warn(
        `Could not find existing lease for instance ${appName} to renew`
      );
      return false;
    } else {
      const instanceInfo = leaseToRenew.getHolder();
      if (!_.isNil(instanceInfo)) {
        const overriddenInstanceStatus = this.getOverriddenInstanceStatus(
          instanceInfo,
          leaseToRenew
        );

        if (overriddenInstanceStatus === InstanceStatus.UNKNOWN) {
          this.logger.log(
            `Instance status UNKNOWN possibly due to deleted override for instance ${appName}; re-register required`
          );
          return false;
        }

        if (instanceInfo.status !== overriddenInstanceStatus) {
          this.logger.log(
            `The instance status ${instanceInfo.status} is different from overridden status ${overriddenInstanceStatus}`
          );
          instanceInfo.setStatusWithoutDirty(overriddenInstanceStatus);
        }
      }

      leaseToRenew.renew();
      return true;
    }
  }

  /**
   * Stores overridden status if it is not already there. This happens during
   * a reconciliation process during renewal requests.
   *
   * @param appName the application name of the instance.
   * @param overriddenStatus overridden status if any.
   */
  public storeOverriddenStatusIfRequired(
    appName: string,
    overriddenStatus?: InstanceStatus
  ) {
    const instanceStatus = this.overriddenStatuses.get(appName);
    if (_.isNil(instanceStatus) || instanceStatus !== overriddenStatus) {
      // We might not have the overridden status if the server got restarted
      this.logger.log(
        `Adding overridden status for instance ${appName} as ${overriddenStatus}`
      );
      this.overriddenStatuses.set(appName, overriddenStatus);
      const instanceInfo = this.getInstanceByApp(appName);
      instanceInfo.setOverriddenStatus(overriddenStatus);
      this.logger.log(
        `Set the overridden status for instance ${appName} as ${overriddenStatus}`
      );
    }
  }

  /**
   * Updates the status of an instance. Normally happens to put an instance
   * between OUT_OF_SERVICE and UP to put the instance in and out of traffic.
   * @param appName The application name of the instance.
   * @param newStatus The new status of the instance.
   * @param lastDirtyTimestamp The last timestamp when this instance information
   * was updated.
   * @returns true if the status was updated, false otherwise.
   */
  public statusUpdate(
    appName: string,
    newStatus: InstanceStatus,
    lastDirtyTimestamp: number
  ): boolean {
    const lease = this.registry.get(appName);
    if (_.isNil(lease)) {
      this.logger.warn(
        `Could not find existing lease for instance ${appName} to update status`
      );
      return false;
    } else {
      const instanceInfo = lease.getHolder();
      if (_.isNil(instanceInfo)) {
        this.logger.error(
          `Found a lease without a holder for instance ${appName}`
        );
      }

      if (!_.isNil(instanceInfo) && instanceInfo.status !== newStatus) {
        if (newStatus === InstanceStatus.UP) {
          lease.serviceUp();
        }

        this.overriddenStatuses.set(appName, newStatus);
        instanceInfo.setOverriddenStatus(newStatus);
        instanceInfo.setStatusWithoutDirty(newStatus);
        if (lastDirtyTimestamp > instanceInfo.lastDirtyTimestamp) {
          instanceInfo.setLastDirtyTimestamp(lastDirtyTimestamp);
        }
        instanceInfo.actionType = ActionType.MODIFIED;
        instanceInfo.setLastUpdatedTimestamp();
      }

      return true;
    }

    return false;
  }

  /**
   * Removes the overridden status for an instance.
   *
   * @param appName the application name of the instance.
   * @param newStatus the new status of the instance.
   * @param lastDirtyTimestamp the last timestamp when this instance information was updated.
   */
  deleteStatusOverride(
    appName: string,
    newStatus: InstanceStatus,
    lastDirtyTimestamp: number
  ): boolean {
    const lease = this.registry.get(appName);
    if (_.isNil(lease)) {
      return false;
    } else {
      lease.renew();
      const instanceInfo = lease.getHolder();

      if (_.isNil(instanceInfo)) {
        this.logger.error(
          `Found a lease without a holder for instance ${appName}`
        );
      }

      const currentOverriddenStatus = this.overriddenStatuses.get(appName);
      this.overriddenStatuses.delete(appName);
      if (!_.isNil(currentOverriddenStatus) && !_.isNil(instanceInfo)) {
        instanceInfo.setOverriddenStatus(InstanceStatus.UNKNOWN);
        instanceInfo.setStatusWithoutDirty(newStatus);
        if (lastDirtyTimestamp > instanceInfo.lastDirtyTimestamp) {
          instanceInfo.setLastDirtyTimestamp(lastDirtyTimestamp);
        }
        instanceInfo.actionType = ActionType.MODIFIED;
        instanceInfo.setLastUpdatedTimestamp();
      }

      return true;
    }
  }

  /**
   * Evict {@link InstanceInfo}s with expired {@link Lease}s.
   */
  public evict(additionalLeaseMs = 0): void {
    this.logger.debug('Running the evict task');

    const expiredLeases = [];
    this.registry.forEach((lease, appName) => {
      if (lease.isExpired(additionalLeaseMs) && !_.isNil(lease.getHolder())) {
        expiredLeases.push(appName);
      }
    });

    const registrySize = this.registry.size;
    const registrySizeThreshold = registrySize * 0.85; //TODO read from config
    const evictionLimit = registrySize - registrySizeThreshold;

    const toEvict = Math.min(expiredLeases.length, evictionLimit);
    if (toEvict > 0) {
      this.logger.log(
        `Evicting ${toEvict} items (expired=${expiredLeases.length}, evictionLimit=${evictionLimit})`
      );

      for (let i = 0; i < toEvict; i++) {
        const next = i + randomInt(expiredLeases.length - i);
        [expiredLeases[i], expiredLeases[next]] = [
          expiredLeases[next],
          expiredLeases[i],
        ];
        const lease = expiredLeases.at(i);

        const appName = lease.getHolder().appName;
        this.cancel(appName);
      }
    }
  }

  /**
   * Returns the given app that is in this instance only
   *
   * @param appName the application name of the application.
   * @returns the application
   */
  public getApplication(appName: string): Application {
    let app: Application = null;

    const lease = this.registry.get(appName);
    if (!_.isNil(lease)) {
      app = new Application(appName);
      app.addInstance(this.decorateInstanceInfo(lease));
    }

    return app;
  }

  /**
   * Gets the list of all {@link Application}s registered with this instance.
   */
  public getApplications(): Application[] {
    const apps: Application[] = [];
    this.registry.forEach((lease) => {
      const app = new Application(lease.getHolder().appName);
      app.addInstance(this.decorateInstanceInfo(lease));
      apps.push(app);
    });

    return apps;
  }

  /**
   * Gets the {@link InstanceInfo} by id.
   * @param appName
   */
  getInstanceByApp(appName: string): InstanceInfo {
    const lease = this.registry.get(appName);
    if (!_.isNil(lease) && !lease.isExpired) {
      return this.decorateInstanceInfo(lease);
    }

    return null;
  }

  decorateInstanceInfo(lease: Lease<InstanceInfo>): InstanceInfo {
    const info = lease.getHolder();

    const renewalInterval = _.defaultTo(
      info.leaseInfo.renewalIntervalInSecs,
      DEFAULT_LEASE_RENEWAL_INTERVAL
    );
    const leaseDuration = _.defaultTo(
      info.leaseInfo.durationInSecs,
      DEFAULT_LEASE_DURATION
    );

    info.leaseInfo = {
      registrationTimestamp: lease.getRegistrationTimestamp(),
      lastRenewalTimestamp: lease.getLastUpdateTimestamp(),
      evictionTimestamp: lease.getEvictionTimestamp(),
      serviceUpTimestamp: lease.getServiceUpTimestamp(),
      durationInSecs: leaseDuration,
      renewalIntervalInSecs: renewalInterval,
    };

    return info;
  }

  private getOverriddenInstanceStatus(
    registrant: InstanceInfo,
    existingLease: Lease<InstanceInfo>
  ) {
    return this.instanceStatusOverrideRule.apply(registrant, existingLease)
      .status;
  }

  /**
   * Get the instance information of all instances.
   *
   * @return the instance information of all instances.
   */
  public getInstances(): InstanceInfo[] {
    const instances: InstanceInfo[] = [];
    this.registry.forEach((lease) => {
      instances.push(lease.getHolder());
    });
    return instances;
  }

  /**
   * Get the instance information of a specific instance.
   *
   * @param appName the application name of the instance.
   * @return the instance information of the instance.
   */
  public getInstance(appName: string): InstanceInfo {
    const lease = this.registry.get(appName);
    if (lease) {
      return lease.getHolder();
    }
    return null;
  }

  getNextServerFromEureka(appName: string, secure: boolean): InstanceInfo {
    throw new Error('Method not implemented.');
  }
}
