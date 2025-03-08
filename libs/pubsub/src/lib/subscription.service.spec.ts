import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
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
import { SubscriptionService } from './subscription.service';

jest.mock('firebase/firestore');

class TestNode implements Node {
  id!: string;
}

describe('SubscriptionService', () => {
  let service: SubscriptionService<TestNode>;
  let logger: BaseLogger;
  let collectionRef: CollectionReference<DocumentData>;
  let pubSub: PubSub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubscriptionService,
          useFactory: (logger, collectionRef, pubSub) =>
            new SubscriptionService(TestNode, logger, collectionRef, pubSub),
          inject: [BaseLogger, 'CollectionReference', PubSub],
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
          provide: PubSub,
          useValue: {
            registerHandler: jest.fn(),
            asyncIterator: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService<TestNode>>(SubscriptionService);
    logger = module.get<BaseLogger>(BaseLogger);
    collectionRef = module.get<CollectionReference<DocumentData>>(
      'CollectionReference',
    );
    pubSub = module.get<PubSub>(PubSub);
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
      (pubSub.asyncIterator as jest.Mock).mockReturnValue(asyncIteratorMock);

      const result = service.subscribeById(id);

      expect(pubSub.registerHandler).toHaveBeenCalledWith(
        topic,
        expect.any(Function),
      );
      expect(result).toBe(asyncIteratorMock);
    });

    it('should broadcast on snapshot', () => {
      const id = 'test-id';
      const asyncIteratorMock = jest.fn();
      (pubSub.asyncIterator as jest.Mock).mockReturnValue(asyncIteratorMock);
      (onSnapshot as jest.Mock).mockImplementation((docRef, cb) => {
        cb({ data: jest.fn().mockReturnValue('data') });
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
  });

  it('should get collection code', () => {
    expect(service['getCollectionCode']()).toBe('TestNode');
  });
});
