import { Logger } from '@nestjs/common';
import {
  InstanceStatusOverrideRule,
  NO_MATCH,
  StatusOverrideResult,
  matchingStatus,
} from '.';
import { InstanceInfo, InstanceStatus } from '../../appinfo/instance-info';
import { Lease } from '../../lease/lease';

export default class DownOrStartingRule implements InstanceStatusOverrideRule {
  private static readonly logger: Logger = new Logger(DownOrStartingRule.name);

  apply(
    instanceInfo: InstanceInfo,
    _existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult {
    if (
      instanceInfo.status !== InstanceStatus.UP &&
      instanceInfo.status !== InstanceStatus.OUT_OF_SERVICE
    ) {
      DownOrStartingRule.logger.debug(
        `Trusting the instance status ${instanceInfo.status} for app ${instanceInfo.appName}`
      );
      return matchingStatus(instanceInfo.status);
    }

    return NO_MATCH;
  }

  toString(): string {
    return DownOrStartingRule.name;
  }
}
