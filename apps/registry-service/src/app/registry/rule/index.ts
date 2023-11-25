import { InstanceInfo, InstanceStatus } from '../../appinfo/instance-info';
import { Lease } from '../../lease/lease';

export interface StatusOverrideResult {
  matches: boolean;
  status?: InstanceStatus;
}

export const NO_MATCH = {
  matches: false,
  status: undefined,
};

export const matchingStatus = (status: InstanceStatus) => ({
  matches: true,
  status,
});

export interface InstanceStatusOverrideRule {
  /**
   * Match this rule.
   *
   * @param instanceInfo The instance info whose status we care about.
   * @param existingLease Does the instance already have a lease? If so let's consider that.
   * @return A result with whether we matched and what w propose the status to be overridden to.
   */
  apply(
    instanceInfo: InstanceInfo,
    existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult;

  toString(): string;
}

export { default as AlwaysMatchInstancesStatusRule } from './always-match-instance-status-rule';
export { default as DownOrStartingRule } from './down-or-starting-rule';
export { default as FirstMatchWinsCompositeRules } from './first-match-wins-composite-rule';
export { default as LeaseExistsRule } from './lease-exists-rule';
export { default as OverrideExistsRule } from './override-exists-rule';
