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

export default class LeaseExistsRule implements InstanceStatusOverrideRule {
  private static readonly logger = new Logger(LeaseExistsRule.name);

  apply(
    instanceInfo: InstanceInfo,
    existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult {
    let existingStatus = null;
    if (!_.isNil(existingLease)) {
      existingStatus = existingLease.getHolder().status;
    }

    // Allow server to have its way if the existing status is UP or OUT_OF_SERVICE
    if (
      !_.isNil(existingStatus) &&
      (existingStatus === InstanceStatus.UP ||
        existingStatus === InstanceStatus.OUT_OF_SERVICE)
    ) {
      LeaseExistsRule.logger.debug(
        `Trusting the existing instance status ${existingStatus} for app ${instanceInfo.appName}`
      );
      return matchingStatus(existingStatus);
    }

    return NO_MATCH;
  }

  toString(): string {
    return LeaseExistsRule.name;
  }
}
