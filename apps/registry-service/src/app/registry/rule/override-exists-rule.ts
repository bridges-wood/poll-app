import { Logger } from '@nestjs/common';
import _ from 'lodash';
import {
  InstanceStatusOverrideRule,
  NO_MATCH,
  StatusOverrideResult,
  matchingStatus,
} from '.';
import { InstanceInfo, InstanceStatus } from '../../appinfo/instance-info';
import { Lease } from '../../lease/lease';

export default class OverrideExistsRule implements InstanceStatusOverrideRule {
  private static readonly logger = new Logger(OverrideExistsRule.name);
  private statusOverrides: Map<string, InstanceStatus>;

  constructor(statusOverrides: Map<string, InstanceStatus>) {
    this.statusOverrides = statusOverrides;
  }

  apply(
    instanceInfo: InstanceInfo,
    _existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult {
    const overridden = this.statusOverrides.get(instanceInfo.appName);
    if (!_.isNil(overridden)) {
      OverrideExistsRule.logger.debug(
        `The instance status ${instanceInfo.status} is being overridden to ${overridden} for app ${instanceInfo.appName}`
      );
      return matchingStatus(overridden);
    }
    return NO_MATCH;
  }

  toString(): string {
    return OverrideExistsRule.name;
  }
}
