/* eslint-disable @typescript-eslint/no-explicit-any */
import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { PubSubTokens } from '@org/pubsub';
import { Firestore } from 'firebase/firestore';
import { getRepositoryToken } from './common/firebase.utils';
import { createFirebaseProviders } from './firebase.providers';
import { Repository } from './firebase.repository';
import { IStoredEntity } from './interfaces';
import { FirebaseTokens } from './tokens';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn().mockReturnValue({
    withConverter: jest.fn().mockReturnValue({}),
  }),
}));

describe('createFirebaseProviders', () => {
  let module: TestingModule;
  let firestore: Firestore;
  let pubSub: PubSub;
  let logger: BaseLogger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: FirebaseTokens.DATABASE,
          useValue: {},
        },
        {
          provide: PubSubTokens.PUBSUB,
          useValue: {},
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    firestore = module.get<Firestore>(FirebaseTokens.DATABASE);
    pubSub = module.get<PubSub>(PubSubTokens.PUBSUB);
    logger = module.get<BaseLogger>(BaseLogger);
  });

  it('should create providers for given entities', () => {
    const entities: IStoredEntity<any>[] = [
      class TestEntity {
        static collectionName = 'testEntities';
        static modelMapper = jest.fn();
      },
    ];

    const providers = createFirebaseProviders(entities) as FactoryProvider[];

    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getRepositoryToken(entities[0]));
    expect(providers[0].inject).toEqual([
      FirebaseTokens.DATABASE,
      PubSubTokens.PUBSUB,
      BaseLogger,
      entities[0].modelMapper,
    ]);

    const repository = providers[0].useFactory(firestore, pubSub, logger);
    expect(repository).toBeInstanceOf(Repository);
  });

  it('should return an empty array if no entities are provided', () => {
    const providers = createFirebaseProviders();
    expect(providers).toEqual([]);
  });

  it('should set logger context correctly', () => {
    const entities: IStoredEntity<any>[] = [
      class TestEntity {
        static collectionName = 'testEntities';
        static modelMapper = jest.fn();
      },
    ];

    const providers = createFirebaseProviders(entities) as FactoryProvider[];
    providers[0].useFactory(firestore, pubSub, logger);

    expect(logger.setContext).toHaveBeenCalledWith('TestEntityRepository');
  });
});
