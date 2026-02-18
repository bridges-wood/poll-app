import { Injectable } from '@nestjs/common';
import {
  OwnedResource,
  ResourceOwnershipProvider,
  ResourceOwnershipRegistry as IResourceOwnershipRegistry,
} from './resource-ownership.interface';

@Injectable()
export class ResourceOwnershipRegistry implements IResourceOwnershipRegistry {
  private providers = new Map<string, ResourceOwnershipProvider>();

  register(resourceType: string, provider: ResourceOwnershipProvider): void {
    this.providers.set(resourceType, provider);
  }

  async getResource(resourceType: string, id: string): Promise<OwnedResource> {
    const provider = this.providers.get(resourceType);
    if (!provider) {
      throw new Error(
        `No ownership provider registered for resource type: ${resourceType}`,
      );
    }
    return provider.findOneById(id);
  }
}
