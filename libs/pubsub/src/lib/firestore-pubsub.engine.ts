import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { PubSubEngine } from 'graphql-subscriptions';
import { PubSubAsyncIterableIterator } from 'graphql-subscriptions/dist/pubsub-async-iterable-iterator';
import { DuplicateTopicError } from './errors/duplicate-topic.error';
import { MissingTopicError } from './errors/missing-topic.error';

export type Listener = (...args: unknown[]) => never;
export type Broadcaster = (data: unknown) => void;
export type UnsubscribeFn = () => boolean | void;
export type Handler<T = unknown> = (
  broadcast: Broadcaster,
  options?: { args: T },
) => UnsubscribeFn;
export type Subscription = {
  topic: string;
  id?: number;
  args?: unknown;
  unsubscribe?: UnsubscribeFn;
};

@Injectable()
export class FirestorePubSubEngine extends PubSubEngine {
  private handlers: Map<string, Handler> = new Map();
  private _nextSubId = 0;
  private subscriptions: Map<string, Subscription> = new Map();

  constructor(protected readonly logger: BaseLogger) {
    super();
    this.logger.setContext(FirestorePubSubEngine.name);
  }

  private get nextSubId(): number {
    this._nextSubId += 1;
    return this._nextSubId;
  }

  private getSubscriptionById(subId: number): Subscription | undefined {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.id === subId,
    );
  }

  public hasHandler(topic: string): boolean {
    return this.handlers.has(topic);
  }

  public registerHandler<T>(topic: string, handler: Handler<T>): void {
    if (this.hasHandler(topic)) {
      throw new DuplicateTopicError(topic);
    }

    this.handlers.set(topic, handler as Handler<unknown>);
    this.logger.debug(`Registered handler for topic: ${topic}`);
  }

  override subscribe(
    topic: string,
    onMessage: Listener,
    options: object,
  ): Promise<number> {
    const handler = this.handlers.get(topic);
    if (!handler) return Promise.reject(new MissingTopicError(topic));

    const existingSubscription = this.subscriptions.get(topic);
    const subId = this.nextSubId;
    const newSubscription: Subscription = {
      topic,
      id: subId,
      args: existingSubscription?.args,
      unsubscribe: handler(onMessage, {
        ...options,
        args: existingSubscription?.args,
      }),
    };
    this.subscriptions.set(topic, newSubscription);

    return Promise.resolve(subId);
  }

  override unsubscribe(subId: number): void {
    const existingSubscription = this.getSubscriptionById(subId);

    if (!existingSubscription || !existingSubscription.unsubscribe) {
      this.logger.debug(
        `No subscription found for ID ${subId}, skipping unsubscribe.`,
      );
      return; // No subscription found or no unsubscribe function
    }

    const result = existingSubscription.unsubscribe();
    this.subscriptions.delete(existingSubscription.topic);

    if (typeof result === 'boolean' && !result) {
      throw new Error(`Unsubscribe failed for subscription ID ${subId}`);
    } else {
      this.logger.debug(
        `Unsubscribed from topic: ${existingSubscription.topic}`,
      );
      return; // Successfully unsubscribed
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  override async publish(topic: string, payload: unknown): Promise<void> {}

  public createAsyncIterableIterator<T>(
    topics: string | readonly string[],
    args: T,
  ): PubSubAsyncIterableIterator<T> {
    const topicArray = Array.isArray(topics) ? topics : [topics];

    topicArray.forEach((topic) =>
      this.subscriptions.set(topic, {
        topic,
        id: undefined,
        args,
        unsubscribe: undefined,
      }),
    );

    return this.asyncIterableIterator<T>(topics);
  }
}
