import { Type } from '@nestjs/common';
import { isNil } from 'lodash';
import { CircularDependencyError } from '../errors/circular-dependency.error';

export function getRepositoryToken(entity: Type): string {
  if (isNil(entity)) {
    throw new CircularDependencyError('@InjectRepository()');
  }

  return `${entity.name}Repository`;
}
