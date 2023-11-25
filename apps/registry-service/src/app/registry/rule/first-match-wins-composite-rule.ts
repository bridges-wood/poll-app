import {
  AlwaysMatchInstancesStatusRule,
  InstanceStatusOverrideRule,
  StatusOverrideResult,
} from '.';
import { InstanceInfo } from '../../appinfo/instance-info';
import { Lease } from '../../lease/lease';

export default class FirstMatchWinsCompositeRules
  implements InstanceStatusOverrideRule
{
  private readonly rules: InstanceStatusOverrideRule[];
  private readonly defaultRule: InstanceStatusOverrideRule;
  private readonly compositeRuleName: string;

  constructor(...rules: InstanceStatusOverrideRule[]) {
    this.rules = rules;
    this.defaultRule = new AlwaysMatchInstancesStatusRule();
    this.compositeRuleName = [...rules, this.defaultRule].reduce(
      (acc, rule) => acc + ',' + rule.toString(),
      ''
    );
  }

  apply(
    instanceInfo: InstanceInfo,
    existingLease: Lease<InstanceInfo>
  ): StatusOverrideResult {
    for (const rule of this.rules) {
      const result = rule.apply(instanceInfo, existingLease);
      if (result.matches) {
        return result;
      }
    }
    return this.defaultRule.apply(instanceInfo, existingLease);
  }

  toString(): string {
    return this.compositeRuleName;
  }
}
