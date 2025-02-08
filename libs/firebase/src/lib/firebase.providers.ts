import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
import { Provider } from '@nestjs/common';
import { Node, PaginationService } from '@org/graphql/pagination';
import { BaseLogger } from '@org/log';
import { PubSubTokens, SubscriptionService } from '@org/pubsub';
import {
  collection,
  Firestore,
  FirestoreDataConverter,
} from 'firebase/firestore';
import { getRepositoryToken } from './common/firebase.utils';
import { Repository } from './firebase.repository';
import { IStoredEntity } from './interfaces';
import { FirebaseTokens } from './tokens';

/**
 * Generates all firebase providers for the given entities.
 * @param entities An array of entities to create providers for.
 * @returns An array of providers for the given entities.
 *
 */
export function createFirebaseProviders<T extends Node>(
  entities?: IStoredEntity<T>[],
): Provider[] {
  return (entities || []).map((entity) => ({
    provide: getRepositoryToken(entity),
    useFactory: (
      database: Firestore,
      pubSub: PubSub,
      logger: BaseLogger,
      modelMapper: FirestoreDataConverter<T>,
    ) => {
      const collectionRef = collection(
        database,
        entity.collectionName,
      ).withConverter(modelMapper);

      const repository = new Repository(
        collectionRef,
        new PaginationService(entity, logger, collectionRef),
        new SubscriptionService(entity, logger, collectionRef, pubSub),
        entity,
      );
      logger.setContext(`${entity.name}Repository`);

      return repository;
    },
    inject: [
      FirebaseTokens.DATABASE,
      PubSubTokens.PUBSUB,
      BaseLogger,
      entity.modelMapper,
    ],
  }));
}
