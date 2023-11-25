import { Injectable } from '@nestjs/common';
import { InstanceInfo } from './appinfo/instance-info';
import { InstanceRegistry } from './registry/instance-registry';
import Application from './shared/application';

@Injectable()
export class AppService {
  constructor(private registry: InstanceRegistry) {}

  getApp(appName: string): Application {
    return this.registry.getApplication(appName);
  }

  register(instanceInfo: InstanceInfo) {
    return this.registry.register(instanceInfo);
  }
}
