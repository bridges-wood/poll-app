import { Injectable, Type } from '@nestjs/common';
import { Node } from '@org/graphql/pagination';
import { BaseLogger } from '@org/log';
import {
  CollectionReference,
  doc,
  DocumentData,
  onSnapshot,
  PartialWithFieldValue,
} from 'firebase/firestore';
import { FirestorePubSubEngine } from './firestore-pubsub.engine';

export interface ISubscriptionService<AppModelType extends Node> {
  subscribeById(id: string): AsyncIterableIterator<AppModelType>;
}

@Injectable()
export class SubscriptionService<
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
> implements ISubscriptionService<AppModelType>
{
  constructor(
    readonly classRef: Type<AppModelType>,
    protected readonly logger: BaseLogger,
    readonly collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
    private readonly pubSub: FirestorePubSubEngine,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  subscribeById(id: string): AsyncIterableIterator<AppModelType> {
    const topic = `${this.getCollectionCode()}Updated:${id}`;

    if (!this.pubSub.hasHandler(topic)) {
      this.logger.debug(`Registering subscription handler for topic: ${topic}`);

      this.pubSub.registerHandler(topic, (broadcast) => {
        const docRef = doc(this.collectionRef, id);
        this.logger.debug(
          `Subscribing to document with id ${id} in collection ${this.getCollectionCode()}`,
        );

        const unsubscribe = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            this.logger.debug(
              `Document with id ${id} updated, broadcasting to subscribers`,
            );
            broadcast(doc.data() as AppModelType);
          }
        });

        return unsubscribe;
      });
    }

    this.logger.debug(`Subscribing to topic: ${topic}`);
    return this.wrapAsyncIterableIterator(
      this.pubSub.asyncIterableIterator<AppModelType>(topic),
    );
  }

  /**
   * Wraps the given async iterable iterator to override its return method, ensuring proper cleanup when the iterator is closed.
   *
   * @param asyncIterableIterator The original async iterable iterator to be wrapped.
   * @returns A new async iterable iterator with an overridden return method.
   */
  private wrapAsyncIterableIterator<T>(
    asyncIterableIterator: AsyncIterableIterator<T>,
  ): AsyncIterableIterator<T> {
    // Preserve the original return method, if it exists
    const innerReturn = asyncIterableIterator.return?.bind(
      asyncIterableIterator,
    );
    const defaultTerminationResult: IteratorResult<T, unknown> = {
      value: undefined,
      done: true,
    };

    asyncIterableIterator.return = async function (
      ...args
    ): Promise<IteratorResult<T>> {
      if (innerReturn) {
        return innerReturn.apply(this, args);
      }

      // If there's no inner return method, simply return the termination result
      return defaultTerminationResult;
    };

    return asyncIterableIterator;
  }

  private getCollectionCode(): string {
    return this.classRef.name;
  }
}
