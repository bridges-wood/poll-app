import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
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

export interface ISubscriptionService<
  AppModelType extends Node,
> {
  subscribeById(id: string): AsyncIterator<AppModelType>;
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
    private readonly pubSub: PubSub,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  subscribeById(id: string): AsyncIterator<AppModelType> {
    const topic = `${this.getCollectionCode}Updated:${id}`;
    this.pubSub.registerHandler(topic, (broadcast) => {
      const docRef = doc(this.collectionRef, id);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        broadcast(doc.data() as AppModelType);
      });

      return unsubscribe;
    });

    return this.pubSub.asyncIterator<AppModelType>(topic);
  }

  private getCollectionCode(): string {
    return this.classRef.name;
  }
}
