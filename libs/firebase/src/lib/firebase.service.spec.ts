import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Node } from '@org/graphql/pagination';
import { getRepositoryToken } from './common/firebase.utils';
import { FirebaseService } from './firebase.service';
import { DocumentData, QueryConstraint } from 'firebase/firestore';
import { IRepository } from './firebase.repository';
import { mock } from 'jest-mock-extended';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

class TestNode implements Node {
  id = '';
}

class TestFirebaseService extends FirebaseService(TestNode) {}

describe('FirebaseService', () => {
  let service: TestFirebaseService;
  let repository: IRepository<TestNode, DocumentData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TestNode),
          useValue: mock<IRepository<TestNode, DocumentData>>(),
        },
        {
          provide: TestFirebaseService,
          useFactory: (moduleRef: ModuleRef) =>
            new TestFirebaseService(moduleRef),
          inject: [ModuleRef],
        },
      ],
    }).compile();

    service = module.get(TestFirebaseService);
    repository = module.get(getRepositoryToken(TestNode));
    await module.init();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository subscribeById method', () => {
    const subscribeByIdSpy = jest.spyOn(repository, 'subscribeById');
    service.subscribeById('test');
    expect(subscribeByIdSpy).toHaveBeenCalledWith('test');
  });

  it('should call repository findOneById method', async () => {
    const findOneByIdSpy = jest.spyOn(repository, 'findOneById');
    await service.findOneById('test');
    expect(findOneByIdSpy).toHaveBeenCalledWith('test');
  });

  it('should call repository findAll method', async () => {
    const findAllSpy = jest.spyOn(repository, 'findAll');
    await service.findAll({});
    expect(findAllSpy).toHaveBeenCalled();
  });

  it('should call repository findByIds method', async () => {
    const findByIdsSpy = jest.spyOn(repository, 'findByIds');
    const ids = ['1', '2'];
    await service.findByIds(ids, {});
    expect(findByIdsSpy).toHaveBeenCalledWith(ids, {});
  });

  it('should call repository findWithConstraints method', async () => {
    const findWithConstraintsSpy = jest.spyOn(
      repository,
      'findWithConstraints',
    );
    const constraints: QueryConstraint = {
      type: 'where',
    };
    await service.findWithConstraints({}, [constraints]);
    expect(findWithConstraintsSpy).toHaveBeenCalledWith({}, [constraints]);
  });
});

describe('FirebaseService', () => {
  describe('onModuleInit', () => {
    it('should throw an error if repository is not found', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: getRepositoryToken(TestNode),
            useValue: undefined,
          },
          {
            provide: TestFirebaseService,
            useFactory: (moduleRef: ModuleRef) =>
              new TestFirebaseService(moduleRef),
            inject: [ModuleRef],
          },
        ],
      }).compile();

      await expect(module.init()).rejects.toThrow(
        new Error(`Repository for ${TestNode.name} not found.`),
      );
    });
  });
});
