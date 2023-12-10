import { Module } from '@nestjs/common';
import PubSub from 'graphql-firestore-subscriptions';
import { PubSubTokens } from './tokens';

@Module({
  controllers: [],
  providers: [{ provide: PubSubTokens.PUBSUB, useValue: new PubSub() }],
  exports: [PubSubTokens.PUBSUB],
})
export class PubSubModule {}
