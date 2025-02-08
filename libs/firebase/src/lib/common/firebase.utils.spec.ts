import { Type } from '@nestjs/common';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { getRepositoryToken } from './firebase.utils';

class TestEntity {}

describe('getRepositoryToken', () => {
  it('should return the correct repository token for a given entity', () => {
    const token = getRepositoryToken(TestEntity);
    expect(token).toBe('TestEntityRepository');
  });

  it('should throw CircularDependencyException if entity is nil', () => {
    expect(() => getRepositoryToken(null as unknown as Type)).toThrow(
      CircularDependencyException,
    );
    expect(() => getRepositoryToken(undefined as unknown as Type)).toThrow(
      CircularDependencyException,
    );
  });
});
