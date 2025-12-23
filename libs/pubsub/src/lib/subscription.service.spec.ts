import { Test, TestingModule } from '@nestjs/testing';
import { Node } from '@org/graphql/pagination';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import {
  CollectionReference,
  doc,
  DocumentData,
  onSnapshot,
} from 'firebase/firestore';
import { FirestorePubSubEngine } from './firestore-pubsub.engine';
import { SubscriptionService } from './subscription.service';

jest.mock('firebase/firestore');

class TestNode implements Node {
  id!: string;
}

describe('SubscriptionService', () => {
  let service: SubscriptionService<TestNode>;
  let logger: BaseLogger;
  let collectionRef: CollectionReference<DocumentData>;
  let pubSub: FirestorePubSubEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubscriptionService,
          useFactory: (logger, collectionRef, pubSub) =>
            new SubscriptionService(TestNode, logger, collectionRef, pubSub),
          inject: [BaseLogger, 'CollectionReference', FirestorePubSubEngine],
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: 'CollectionReference',
          useValue: {},
        },
        {
          provide: FirestorePubSubEngine,
          useValue: {
            registerHandler: jest.fn(),
            hasHandler: jest.fn().mockReturnValue(false),
            asyncIterableIterator: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService<TestNode>>(SubscriptionService);
    logger = module.get<BaseLogger>(BaseLogger);
    collectionRef = module.get<CollectionReference<DocumentData>>(
      'CollectionReference',
    );
    pubSub = module.get<FirestorePubSubEngine>(FirestorePubSubEngine);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set logger context', () => {
    expect(logger.setContext).toHaveBeenCalledWith('SubscriptionService');
  });

  describe('subscribeById', () => {
    it('should return an async iterator', () => {
      const id = 'test-id';
      const topic = `TestNodeUpdated:${id}`;
      const asyncIteratorMock = jest.fn();
      (pubSub.asyncIterableIterator as jest.Mock).mockReturnValue(
        asyncIteratorMock,
      );

      const result = service.subscribeById(id);

      expect(pubSub.registerHandler).toHaveBeenCalledWith(
        topic,
        expect.any(Function),
      );
      expect(result).toBe(asyncIteratorMock);
    });

    it('should reuse existing handler if present', () => {
      const id = 'test-id';
      const asyncIteratorMock = jest.fn();
      (pubSub.asyncIterableIterator as jest.Mock).mockReturnValue(
        asyncIteratorMock,
      );
      (pubSub.hasHandler as jest.Mock).mockReturnValue(true);

      const result = service.subscribeById(id);
      expect(pubSub.registerHandler).toHaveBeenCalledTimes(0);
      expect(result).toBe(asyncIteratorMock);
    });

    it('should broadcast on snapshot', () => {
      const id = 'test-id';
      const asyncIteratorMock = jest.fn();
      (pubSub.asyncIterableIterator as jest.Mock).mockReturnValue(
        asyncIteratorMock,
      );
      (onSnapshot as jest.Mock).mockImplementation((docRef, cb) => {
        cb({ exists: () => true, data: jest.fn().mockReturnValue('data') });
        return jest.fn();
      });
      (doc as jest.Mock).mockReturnValue('doc-ref');

      const result = service.subscribeById(id);

      expect(result).toBe(asyncIteratorMock);

      const handler = (pubSub.registerHandler as jest.Mock).mock.calls[0][1];
      handler(asyncIteratorMock);

      expect(doc).toHaveBeenCalledWith(collectionRef, id);
      expect(onSnapshot).toHaveBeenCalledWith('doc-ref', expect.any(Function));
      expect(asyncIteratorMock).toHaveBeenCalledWith('data');
    });

    it('should not broadcast if document does not exist', () => {
      const id = 'test-id';
      const asyncIteratorMock = jest.fn();
      (pubSub.asyncIterableIterator as jest.Mock).mockReturnValue(
        asyncIteratorMock,
      );
      (onSnapshot as jest.Mock).mockImplementation((docRef, cb) => {
        cb({ exists: () => false });
        return jest.fn();
      });
      (doc as jest.Mock).mockReturnValue('doc-ref');

      const result = service.subscribeById(id);

      expect(result).toBe(asyncIteratorMock);

      const handler = (pubSub.registerHandler as jest.Mock).mock.calls[0][1];
      handler(asyncIteratorMock);

      expect(doc).toHaveBeenCalledWith(collectionRef, id);
      expect(onSnapshot).toHaveBeenCalledWith('doc-ref', expect.any(Function));
      expect(asyncIteratorMock).not.toHaveBeenCalled();
    });
  });

  it('should get collection code', () => {
    expect(service['getCollectionCode']()).toBe('TestNode');
  });

  describe('wrapAsyncIterableIterator', () => {
    it('should return the same iterator', () => {
      const mockIterator: AsyncIterableIterator<any> = {
        [Symbol.asyncIterator]: () => mockIterator,
        next: jest.fn(),
        return: jest.fn(),
      };
      const result = service['wrapAsyncIterableIterator'](mockIterator);
      expect(result).toBe(mockIterator);
    });

    it('should call original return if exists', async () => {
      const originalReturn = jest
        .fn()
        .mockResolvedValue({ done: true, value: undefined });
      const mockIterator: AsyncIterableIterator<any> = {
        [Symbol.asyncIterator]: () => mockIterator,
        next: jest.fn(),
        return: originalReturn,
      };
      service['wrapAsyncIterableIterator'](mockIterator);
      const result = await mockIterator.return?.();
      expect(originalReturn).toHaveBeenCalled();
      expect(result).toBe(await originalReturn());
    });

    it('should return default termination if no original return', async () => {
      const mockIterator: AsyncIterableIterator<any> = {
        [Symbol.asyncIterator]: () => mockIterator,
        next: jest.fn(),
        return: undefined as never,
      };
      service['wrapAsyncIterableIterator'](mockIterator);
      const result = await mockIterator.return?.();
      expect(result).toEqual({ value: undefined, done: true });
    });
  });
});
