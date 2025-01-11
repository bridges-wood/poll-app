import { Type } from '@nestjs/common';
import { TypeMetadataStorage } from '@nestjs/graphql';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import {
  CollectionReference,
  doc,
  DocumentData,
  DocumentSnapshot,
  endBefore,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  PartialWithFieldValue,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  startAfter,
} from 'firebase/firestore';
import { EMPTY_PAGE } from './constants';
import { PaginationArgs } from './models/pagination.args';
import { PaginationService } from './pagination.service';
import type {
  IBackwardPagination,
  IEdgeType,
  IForwardPagination,
  Node,
} from './types';

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  getFirestore: jest.fn(),
  initializeFirestore: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  startAfter: jest.fn(),
  endBefore: jest.fn(),
  limit: jest.fn(),
  where: jest.fn(),
  getCountFromServer: jest.fn(),
}));

class TestNode implements Node {
  constructor(public id: string) {}
}

class TestPaginationService extends PaginationService<TestNode> {
  public override getChunksForQuery(
    ids: Node['id'][],
    args: PaginationArgs,
  ): Node['id'][][] {
    return super.getChunksForQuery(ids, args);
  }

  public override async fetchChunk(
    chunk: Node['id'][],
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<IEdgeType<TestNode>[]> {
    return super.fetchChunk(chunk, collectionRef);
  }

  public override async prepareConstraints(
    args: PaginationArgs,
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<QueryConstraint[]> {
    return super.prepareConstraints(args, collectionRef);
  }

  public override getValidSortByFields(): string[] {
    return super.getValidSortByFields();
  }

  public override getFields(ref: Type<unknown>): string[] {
    return super.getFields(ref);
  }

  public override getInterfaceFields(ref: Type<unknown>): string[] {
    return super.getInterfaceFields(ref);
  }

  public override prepareSortConstraint(
    args: PaginationArgs,
  ): QueryConstraint | null {
    return super.prepareSortConstraint(args);
  }

  public override async prepareForwardPaginationConstraints(
    args: IForwardPagination,
    constraints: QueryConstraint[],
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<QueryConstraint[]> {
    return super.prepareForwardPaginationConstraints(
      args,
      constraints,
      collectionRef,
    );
  }

  public override async prepareBackwardPaginationConstraints(
    args: IBackwardPagination,
    constraints: QueryConstraint[],
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<QueryConstraint[]> {
    return super.prepareBackwardPaginationConstraints(
      args,
      constraints,
      collectionRef,
    );
  }

  public override async getTotalCount(
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<number> {
    return super.getTotalCount(collectionRef);
  }

  public override async hasNextPage(
    docs: QueryDocumentSnapshot<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >[],
    reversed: boolean,
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<boolean> {
    return super.hasNextPage(docs, reversed, collectionRef);
  }

  public override async hasPreviousPage(
    docs: QueryDocumentSnapshot<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >[],
    reversed: boolean,
    collectionRef: CollectionReference<
      PartialWithFieldValue<TestNode>,
      PartialWithFieldValue<DocumentData>
    >,
  ): Promise<boolean> {
    return super.hasPreviousPage(docs, reversed, collectionRef);
  }
}

describe('PaginationService', () => {
  let service: TestPaginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: TestPaginationService,
          useFactory: (logger: BaseLogger) =>
            new TestPaginationService(TestNode, logger, {
              path: 'test',
            } as CollectionReference),
          inject: [BaseLogger],
        },
      ],
    }).compile();

    service = module.get<TestPaginationService>(TestPaginationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should throw an error if collectionRef is not provided', async () => {
      const testService = new TestPaginationService(
        TestNode,
        new TestLogger(),
        undefined,
      );
      await expect(testService.findAll({ first: 10 })).rejects.toThrow(
        'Collection reference must be provided',
      );
    });

    it('should throw an error if neither "first" nor "last" is provided', async () => {
      await expect(service.findAll({} as PaginationArgs)).rejects.toThrow(
        'At least one of "first" or "last" must be provided',
      );
    });

    it('allows a collectionRefOverride to be provided', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      jest.spyOn(service, 'prepareConstraints').mockResolvedValue([]);
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(0);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      await service.findAll(
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(query).toHaveBeenCalledWith(collectionRef);
    });

    it('should return EMPTY_PAGE if querySnapshot is empty', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      jest.spyOn(service, 'prepareConstraints').mockResolvedValue([]);
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(0);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      const result = await service.findAll(
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(result).toEqual(EMPTY_PAGE);
    });

    it('should return edges and pageInfo', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const node = { id: '1' } as TestNode;
      const doc = { data: () => node } as DocumentData;
      jest.spyOn(service, 'prepareConstraints').mockResolvedValue([]);
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(1);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [doc] });

      const result = await service.findAll(
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(result.edges).toHaveLength(1);
      expect(result.pageInfo).toEqual({
        startCursor: expect.any(String),
        endCursor: expect.any(String),
        hasNextPage: false,
        hasPreviousPage: false,
        count: 1,
      });
    });
  });

  describe('findByIds', () => {
    it('should throw an error if collectionRef is not provided', async () => {
      const testService = new TestPaginationService(
        TestNode,
        new TestLogger(),
        undefined,
      );
      await expect(testService.findByIds(['1'], { first: 10 })).rejects.toThrow(
        'Collection reference must be provided',
      );
    });

    it('should throw an error if neither "first" nor "last" is provided', async () => {
      await expect(
        service.findByIds(['1'], {} as PaginationArgs, {
          collectionRefOverride: { path: 'test' } as CollectionReference,
        }),
      ).rejects.toThrow('At least one of "first" or "last" must be provided');
    });

    it('allows a collectionRefOverride to be provided', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
      jest.spyOn(service, 'fetchChunk').mockResolvedValue([]);

      await service.findByIds(
        ['1'],
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(service.fetchChunk).toHaveBeenCalledWith(['1'], collectionRef);
    });

    it('should return EMPTY_PAGE if chunks are empty', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      jest.spyOn(service, 'getChunksForQuery').mockReturnValue([]);
      const result = await service.findByIds(
        ['1'],
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(result).toEqual(EMPTY_PAGE);
    });

    it('should return edges and pageInfo', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const node = { id: '1' } as TestNode;
      const edge = { node, cursor: 'cursor' };
      jest.spyOn(service, 'getChunksForQuery').mockReturnValue([['1']]);
      jest.spyOn(service, 'fetchChunk').mockResolvedValue([edge]);

      const result = await service.findByIds(
        ['1'],
        { first: 10 },
        { collectionRefOverride: collectionRef },
      );

      expect(result.edges).toHaveLength(1);
      expect(result.pageInfo).toEqual({
        startCursor: 'cursor',
        endCursor: 'cursor',
        hasNextPage: false,
        hasPreviousPage: false,
        count: 1,
      });
    });
  });

  describe('findWithConstraints', () => {
    it('should throw an error if collectionRef is not provided', async () => {
      const testService = new TestPaginationService(
        TestNode,
        new TestLogger(),
        undefined,
      );
      await expect(
        testService.findWithConstraints({ first: 10 }, []),
      ).rejects.toThrow('Collection reference must be provided');
    });

    it('should throw an error if neither "first" nor "last" is provided', async () => {
      await expect(
        service.findWithConstraints({} as PaginationArgs, [], {
          collectionRefOverride: { path: 'test' } as CollectionReference,
        }),
      ).rejects.toThrow('At least one of "first" or "last" must be provided');
    });

    it('allows a collectionRefOverride to be provided', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(0);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      await service.findWithConstraints({ first: 10 }, [], {
        collectionRefOverride: collectionRef,
      });

      expect(query).toHaveBeenCalledWith(collectionRef);
    });

    it('should return EMPTY_PAGE if querySnapshot is empty', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(0);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      const result = await service.findWithConstraints({ first: 10 }, [], {
        collectionRefOverride: collectionRef,
      });

      expect(result).toEqual(EMPTY_PAGE);
    });

    it('should return edges and pageInfo', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const node = { id: '1' } as TestNode;
      const doc = { data: () => node } as DocumentData;
      jest.spyOn(service, 'getTotalCount').mockResolvedValue(1);
      jest.spyOn(service, 'hasNextPage').mockResolvedValue(false);
      jest.spyOn(service, 'hasPreviousPage').mockResolvedValue(false);
      (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [doc] });

      const result = await service.findWithConstraints({ first: 10 }, [], {
        collectionRefOverride: collectionRef,
      });

      expect(result.edges).toHaveLength(1);
      expect(result.pageInfo).toEqual({
        startCursor: expect.any(String),
        endCursor: expect.any(String),
        hasNextPage: false,
        hasPreviousPage: false,
        count: 1,
      });
    });
  });

  describe('getChunksForQuery', () => {
    const ids = ['1', '2', '3', '4', '5'];

    it('should return chunks for forward pagination', () => {
      const args: PaginationArgs = { first: 3 };
      const result = service.getChunksForQuery(ids, args);
      expect(result).toEqual([['1', '2', '3']]);
    });

    it('should return chunks for forward pagination with after cursor', () => {
      const args: PaginationArgs = { first: 2, after: btoa('2') };
      const result = service.getChunksForQuery(ids, args);
      expect(result).toEqual([['3', '4']]);
    });

    it('should throw an error if after cursor is not found', () => {
      const cursor = btoa('6');
      const args: PaginationArgs = { first: 2, after: cursor };
      expect(() => service.getChunksForQuery(ids, args)).toThrow(
        `Cursor "${cursor}" not found`,
      );
    });

    it('should return chunks for backward pagination', () => {
      const args: PaginationArgs = { last: 3 };
      const result = service.getChunksForQuery(ids, args);
      expect(result).toEqual([['3', '4', '5']]);
    });

    it('should return chunks for backward pagination with before cursor', () => {
      const args: PaginationArgs = { last: 2, before: btoa('4') };
      const result = service.getChunksForQuery(ids, args);
      expect(result).toEqual([['2', '3']]);
    });

    it('should throw an error if before cursor is not found', () => {
      const cursor = btoa('6');
      const args: PaginationArgs = { last: 2, before: cursor };
      expect(() => service.getChunksForQuery(ids, args)).toThrow(
        `Cursor "${cursor}" not found`,
      );
    });

    it('should return empty array if no pagination args are provided', () => {
      const args = {} as PaginationArgs;
      const result = service.getChunksForQuery(ids, args);
      expect(result).toEqual([]);
    });
  });

  describe('fetchChunk', () => {
    it('should fetch chunk of documents', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const node = { id: '1' } as TestNode;
      const doc = { data: () => node } as DocumentData;
      (getDocs as jest.Mock).mockResolvedValue({ docs: [doc] });

      const result = await service.fetchChunk(['1'], collectionRef);

      expect(result).toHaveLength(1);
      expect(result[0].node).toEqual(node);
    });
  });

  describe('prepareConstraints', () => {
    it('should prepare constraints for forward pagination', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: PaginationArgs = { first: 10 };
      jest
        .spyOn(service, 'prepareSortConstraint')
        .mockReturnValue({} as QueryConstraint);
      jest
        .spyOn(service, 'prepareForwardPaginationConstraints')
        .mockResolvedValue([{} as QueryConstraint]);

      const result = await service.prepareConstraints(args, collectionRef);

      expect(result).toHaveLength(1);
    });

    it('should prepare constraints for backward pagination', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: PaginationArgs = { last: 10 };
      jest
        .spyOn(service, 'prepareSortConstraint')
        .mockReturnValue({} as QueryConstraint);
      jest
        .spyOn(service, 'prepareBackwardPaginationConstraints')
        .mockResolvedValue([{} as QueryConstraint]);

      const result = await service.prepareConstraints(args, collectionRef);

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no pagination args are provided', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args = {} as PaginationArgs;

      const result = await service.prepareConstraints(args, collectionRef);
      expect(result).toEqual([]);
    });

    it('should add an orderBy constraint if a sortBy field is provided', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: PaginationArgs = { orderBy: 'field1' };
      jest
        .spyOn(service, 'prepareSortConstraint')
        .mockReturnValue({} as QueryConstraint);

      const result = await service.prepareConstraints(args, collectionRef);

      expect(result).toHaveLength(1);
    });
  });

  describe('getValidSortByFields', () => {
    it('should support an array class reference', () => {
      class TestNode2 extends TestNode {
        constructor(public field2: string) {
          super('1');
        }
      }

      const testService = new TestPaginationService(
        [TestNode, TestNode2] as unknown as readonly [Type<TestNode>],
        new TestLogger(),
        {
          path: 'test',
        } as CollectionReference,
      );
      jest
        .spyOn(testService, 'getFields')
        .mockReturnValueOnce(['field1'])
        .mockReturnValueOnce(['field2']);

      const result = testService.getValidSortByFields();
      expect(result).toEqual(['field1', 'field2']);
    });

    it('should return valid sort by fields', () => {
      jest.spyOn(service, 'getFields').mockReturnValue(['field1', 'field2']);
      const result = service.getValidSortByFields();
      expect(result).toEqual(['field1', 'field2']);
    });

    it('should throw an error if no fields are found', () => {
      jest.spyOn(service, 'getFields').mockReturnValue([]);
      expect(() => service.getValidSortByFields()).toThrow('No fields found');
    });
  });

  describe('getFields', () => {
    it('should return fields for a given class reference', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          properties: [{ name: 'field1' }, { name: 'field2' }],
        } as ObjectTypeMetadata);

      const result = service.getFields(ref);

      expect(result).toEqual(['field1', 'field2', 'id']);
    });

    it('should return fields for a given class reference that extends one recognized interface where the return type of interfaces is a function ', () => {
      class TestNode2 extends TestNode {
        constructor(public field2: string) {
          super('1');
        }
      }

      const ref = TestNode2;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          properties: [{ name: 'field1' }, { name: 'field2' }],
          interfaces: jest.fn().mockReturnValue(TestNode),
        } as unknown as ObjectTypeMetadata);
      jest.spyOn(service, 'getInterfaceFields').mockReturnValueOnce(['field1']);

      const result = service.getFields(ref);

      expect(result).toEqual(['field1', 'field2', 'id', 'field1']);
    });

    it('should return fields for a given class reference that extends multiple recognized interfaces where the return type of interfaces is a function ', () => {
      class TestNode2 extends TestNode {
        constructor(public field2: string) {
          super('1');
        }
      }

      class TestNode3 extends TestNode2 {
        constructor(public field3: string) {
          super('2');
        }
      }

      const ref = TestNode3;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          properties: [
            { name: 'field1' },
            { name: 'field2' },
            { name: 'field3' },
          ],
          interfaces: jest.fn().mockReturnValue([TestNode, TestNode2]),
        } as unknown as ObjectTypeMetadata);
      jest
        .spyOn(service, 'getInterfaceFields')
        .mockReturnValueOnce(['field1'])
        .mockReturnValueOnce(['field2']);

      const result = service.getFields(ref);

      expect(result).toEqual([
        'field1',
        'field2',
        'field3',
        'id',
        'field1',
        'field2',
      ]);
    });

    it('should return fields for a given class reference that extends one recognized interface where the return type of interfaces is an array ', () => {
      class TestNode2 extends TestNode {
        constructor(public field2: string) {
          super('1');
        }
      }

      const ref = TestNode2;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          properties: [{ name: 'field1' }, { name: 'field2' }],
          interfaces: [TestNode],
        } as unknown as ObjectTypeMetadata);
      jest.spyOn(service, 'getInterfaceFields').mockReturnValueOnce(['field1']);

      const result = service.getFields(ref);

      expect(result).toEqual(['field1', 'field2', 'id', 'field1']);
    });

    it('should return fields for a given class reference that extends multiple recognized interfaces where the return type of interfaces is an array ', () => {
      class TestNode2 extends TestNode {
        constructor(public field2: string) {
          super('1');
        }
      }

      class TestNode3 extends TestNode2 {
        constructor(public field3: string) {
          super('2');
        }
      }

      const ref = TestNode3;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          properties: [
            { name: 'field1' },
            { name: 'field2' },
            { name: 'field3' },
          ],
          interfaces: [TestNode, TestNode2],
        } as unknown as ObjectTypeMetadata);
      jest
        .spyOn(service, 'getInterfaceFields')
        .mockReturnValueOnce(['field1'])
        .mockReturnValueOnce(['field2']);

      const result = service.getFields(ref);

      expect(result).toEqual([
        'field1',
        'field2',
        'field3',
        'id',
        'field1',
        'field2',
      ]);
    });

    it('should throw an error if the type is not registered', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue(undefined);

      expect(() => service.getFields(ref)).toThrow(
        `No fields found for ${ref.name}`,
      );
    });

    it('should return an array of just "id" if no properties are found', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getObjectTypeMetadataByTarget')
        .mockReturnValue({
          name: 'TestNode',
          target: TestNode,
        } as ObjectTypeMetadata);

      const result = service.getFields(ref);

      expect(result).toEqual(['id']);
    });
  });

  describe('getInterfaceFields', () => {
    it('should return fields for a given interface reference', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getInterfaceMetadataByTarget')
        .mockReturnValue({
          properties: [{ name: 'field1' }, { name: 'field2' }],
        } as ObjectTypeMetadata);

      const result = service.getInterfaceFields(ref);

      expect(result).toEqual(['field1', 'field2']);
    });

    it('should throw an error the interface is not registered', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getInterfaceMetadataByTarget')
        .mockReturnValue(undefined);

      expect(() => service.getInterfaceFields(ref)).toThrow(
        `No fields found for ${ref.name}`,
      );
    });

    it('returns an empty array if no properties are found', () => {
      const ref = TestNode;
      jest
        .spyOn(TypeMetadataStorage, 'getInterfaceMetadataByTarget')
        .mockReturnValue({
          name: 'TestNode',
          target: TestNode,
        } as ObjectTypeMetadata);

      const result = service.getInterfaceFields(ref);

      expect(result).toEqual([]);
    });
  });

  describe('prepareSortConstraint', () => {
    it('should prepare sort constraint for forward pagination', () => {
      const args: PaginationArgs = { first: 10, orderBy: 'field1' };
      jest.spyOn(service, 'getValidSortByFields').mockReturnValue(['field1']);

      const result = service.prepareSortConstraint(args);
      expect(result).toEqual(orderBy('field1', 'asc'));
    });

    it('should prepare sort constraint for backward pagination', () => {
      const args: PaginationArgs = { last: 10, orderBy: 'field1' };
      jest.spyOn(service, 'getValidSortByFields').mockReturnValue(['field1']);

      const result = service.prepareSortConstraint(args);
      expect(result).toEqual(orderBy('field1', 'desc'));
    });

    it('return null if no orderBy field is provided', () => {
      const args: PaginationArgs = { first: 10 };
      jest.spyOn(service, 'getValidSortByFields').mockReturnValue(['field1']);

      const result = service.prepareSortConstraint(args);
      expect(result).toBeNull();
    });

    it('should sort by __name__ if orderBy field is id', () => {
      const args: PaginationArgs = { first: 10, orderBy: 'id' };
      jest
        .spyOn(service, 'getValidSortByFields')
        .mockReturnValue(['field1', 'id']);

      const result = service.prepareSortConstraint(args);
      expect(result).toEqual(orderBy('__name__', 'asc'));
    });

    it('should throw an error if sortBy field is invalid', () => {
      const args: PaginationArgs = { first: 10, orderBy: 'invalidField' };
      jest.spyOn(service, 'getValidSortByFields').mockReturnValue(['field1']);

      expect(() => service.prepareSortConstraint(args)).toThrow(
        'Invalid sortBy field "invalidField". Valid fields are: field1.',
      );
    });

    it('should return a default sortBy if other pagination args are passed', () => {
      const args = { orderBy: 'field1' } as PaginationArgs;
      jest.spyOn(service, 'getValidSortByFields').mockReturnValue(['field1']);

      const result = service.prepareSortConstraint(args);
      expect(result).toEqual(orderBy('field1'));
    });
  });

  describe('prepareForwardPaginationConstraints', () => {
    it('should prepare forward pagination constraints', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IForwardPagination = { first: 10 };
      const constraints: QueryConstraint[] = [];
      const result = await service.prepareForwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );
      expect(result).toHaveLength(1);
    });

    it('should prepare forward pagination constraints with startAfter', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IForwardPagination = { first: 10, after: btoa('5') };
      const constraints: QueryConstraint[] = [];
      (doc as jest.Mock).mockReturnValue({ id: '5' });
      const docSnapshot = { id: 5 } as unknown as DocumentSnapshot;
      (getDoc as jest.Mock).mockResolvedValue(docSnapshot);

      const result = await service.prepareForwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );

      expect(result).toHaveLength(2);
      expect(startAfter).toHaveBeenCalledWith(docSnapshot);
    });

    it('should throw an error if after cursor is empty', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IForwardPagination = { first: 10, after: '' };
      const constraints: QueryConstraint[] = [];
      await expect(
        service.prepareForwardPaginationConstraints(
          args,
          constraints,
          collectionRef,
        ),
      ).rejects.toThrow('After cannot be an empty string');
    });
  });

  describe('prepareBackwardPaginationConstraints', () => {
    it('should prepare backward pagination constraints', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IBackwardPagination = { last: 10 };
      const constraints: QueryConstraint[] = [];
      const result = await service.prepareBackwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );
      expect(result).toHaveLength(1);
    });

    it('should prepare backward pagination constraints with endBefore', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IBackwardPagination = { last: 10, before: btoa('5') };
      const constraints: QueryConstraint[] = [];
      (doc as jest.Mock).mockReturnValue({ id: '5' });
      const docSnapshot = { id: 5 } as unknown as DocumentSnapshot;
      (getDoc as jest.Mock).mockResolvedValue(docSnapshot);

      const result = await service.prepareBackwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );

      expect(result).toHaveLength(2);
      expect(endBefore).toHaveBeenCalledWith(docSnapshot);
    });

    it('should throw an error if before cursor is empty', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const args: IBackwardPagination = { last: 10, before: '' };
      const constraints: QueryConstraint[] = [];
      await expect(
        service.prepareBackwardPaginationConstraints(
          args,
          constraints,
          collectionRef,
        ),
      ).rejects.toThrow('Before cannot be an empty string');
    });
  });

  describe('getTotalCount', () => {
    it('should return total count of documents', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      (getCountFromServer as jest.Mock).mockResolvedValue({
        data: () => ({ count: 5 }),
      });

      const result = await service.getTotalCount(collectionRef);

      expect(result).toBe(5);
    });
  });

  describe('hasNextPage', () => {
    it('should return true if there is a next page', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: false });

      const result = await service.hasNextPage(docs, false, collectionRef);

      expect(result).toBe(true);
    });

    it('should return true if there is a next page when reversed is true', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: false });

      const result = await service.hasNextPage(docs, true, collectionRef);

      expect(result).toBe(true);
    });

    it('should return false if there is no next page', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: true });

      const result = await service.hasNextPage(docs, false, collectionRef);

      expect(result).toBe(false);
    });
  });

  describe('hasPreviousPage', () => {
    it('should return true if there is a previous page', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: false });

      const result = await service.hasPreviousPage(docs, false, collectionRef);

      expect(result).toBe(true);
    });

    it('should return true if there is a previous page when reversed is true', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: false });

      const result = await service.hasPreviousPage(docs, true, collectionRef);

      expect(result).toBe(true);
    });

    it('should return false if there is no previous page', async () => {
      const collectionRef = { path: 'test' } as CollectionReference;
      const docs = [{ id: '1' }] as QueryDocumentSnapshot[];
      (getDocs as jest.Mock).mockResolvedValue({ empty: true });

      const result = await service.hasPreviousPage(docs, false, collectionRef);

      expect(result).toBe(false);
    });
  });
});
