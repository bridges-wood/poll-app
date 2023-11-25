import { Logger } from '@nestjs/common';
import {
  InstanceStatusOverrideRule,
  StatusOverrideResult,
  matchingStatus,
} from '.';
import { InstanceInfo } from '../../appinfo/instance-info';
import { Lease } from '../../lease/lease';

export default class AlwaysMatchInstancesStatusRule
  implements InstanceStatusOverrideRule
{
  private static readonly logger: Logger = new Logger(
    AlwaysMatchInstancesStatusRule.name
  );

  apply(
    instanceInfo: InstanceInfo,
    _existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult {
    AlwaysMatchInstancesStatusRule.logger.debug(
      `Returning the default instance status ${instanceInfo.status} for app ${instanceInfo.appName}`
    );
    return matchingStatus(instanceInfo.status);
  }

  toString(): string {
    return AlwaysMatchInstancesStatusRule.name;
  }
}
