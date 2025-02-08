import { NotFoundError } from '@org/errors';
import { PaginationService } from '@org/graphql/pagination';
import { CollectionReference, DocumentData, getDoc } from 'firebase/firestore';
import { Repository } from './firebase.repository';

jest.mock('firebase/firestore');

class TestNode implements DocumentData {
  id = '';
}

describe('Repository', () => {
  let collectionRef: CollectionReference<TestNode>;
  let paginationService: PaginationService<TestNode, DocumentData>;
  let repository: Repository<TestNode, DocumentData>;

  beforeEach(() => {
    collectionRef = {} as CollectionReference<TestNode>;
    paginationService = {
      findOneById: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      findWithConstraints: jest.fn(),
    } as unknown as PaginationService<TestNode, DocumentData>;
    repository = new Repository(collectionRef, paginationService, TestNode);
  });

  it('should create', () => {
    expect(repository).toBeTruthy();
  });

  describe('findOneById', () => {
    it('should return the document if it exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: () => ({ id: 'test' }),
      });
      const result = await repository.findOneById('test');
      expect(result).toEqual({ id: 'test' });
    });

    it('should throw NotFoundError if the document does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(false),
      });
      await expect(repository.findOneById('test')).rejects.toThrow(
        new NotFoundError('TestNode with id "test" not found'),
      );
    });
  });

  it('should call findAll on paginationService', async () => {
    await repository.findAll({});
    expect(paginationService.findAll).toHaveBeenCalledWith({});
  });

  it('should call findByIds on paginationService', async () => {
    await repository.findByIds([], {});
    expect(paginationService.findByIds).toHaveBeenCalledWith([], {});
  });

  it('should call findWithConstraints on paginationService', async () => {
    await repository.findWithConstraints({}, []);
    expect(paginationService.findWithConstraints).toHaveBeenCalledWith({}, []);
  });
});
