import { Module } from '@nestjs/common';
import { InstanceRegistry } from './instance-registry';

@Module({
  providers: [InstanceRegistry],
  exports: [InstanceRegistry],
})
export class RegistryModule {}
