import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
import { Module } from '@nestjs/common';
import { PubSubTokens } from './tokens';

@Module({
  controllers: [],
  providers: [{ provide: PubSubTokens.PUBSUB, useValue: new PubSub() }],
  exports: [PubSubTokens.PUBSUB],
})
export class PubSubModule {}
