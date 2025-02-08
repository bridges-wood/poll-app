import { ModuleMetadata } from '@nestjs/common';
import { Node } from '@org/graphql/pagination';
import { IStoredEntity } from './stored-entity';

export interface FirebaseModuleOptions<T extends Node>
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  entities: IStoredEntity<T>[];
}
