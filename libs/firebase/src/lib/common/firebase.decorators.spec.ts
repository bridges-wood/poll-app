import { Inject } from '@nestjs/common';
import { InjectRepository } from './firebase.decorators';
import { getRepositoryToken } from './firebase.utils';

jest.mock('./firebase.utils', () => ({
  getRepositoryToken: jest.fn(),
}));

jest.mock('@nestjs/common', () => ({
  Inject: jest.fn(),
}));

describe('InjectRepository', () => {
  class TestEntity {}

  it('should call getRepositoryToken with the entity', () => {
    InjectRepository(TestEntity);
    expect(getRepositoryToken).toHaveBeenCalledWith(TestEntity);
  });

  it('should return the result of Inject with the repository token', () => {
    const token = 'TestEntityRepository';
    (getRepositoryToken as jest.Mock).mockReturnValue(token);

    const result = InjectRepository(TestEntity);

    expect(Inject).toHaveBeenCalledWith(token);
    expect(result).toBe(Inject(token));
  });
});
