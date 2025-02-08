import { Type } from '@nestjs/common';
import { isNil } from 'lodash';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';

export function getRepositoryToken(entity: Type): string {
  if (isNil(entity)) {
    throw new CircularDependencyException('@InjectRepository()');
  }

  return `${entity.name}Repository`;
}
