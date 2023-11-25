import _ from 'lodash';
import { InstanceInfo } from '../appinfo/instance-info';

export interface ServiceUrlRandomizer {
  randomize(serviceUrls: string[]): string[];
}

export class InstanceInfoBasedUrlRandomizer implements ServiceUrlRandomizer {
  private readonly instanceInfo: InstanceInfo;

  constructor(instanceInfo: InstanceInfo) {
    this.instanceInfo = instanceInfo;
  }
  randomize(serviceUrls: string[]): string[] {
    const result = [];
    if (this.instanceInfo || _.isEmpty(serviceUrls)) {
      return [];
    }

    const randomIndex = Math.floor(Math.random() * serviceUrls.length);
    const backupIndex = (randomIndex + 1) % serviceUrls.length;
    for (let i = 0; i < backupIndex; i++) {
      result.push(serviceUrls.shift()!);
    }
    return result;
  }
}
