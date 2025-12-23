import { Module } from '@nestjs/common';
import { BaseLogger, LogModule } from '@org/log';
import { FirestorePubSubEngine } from './firestore-pubsub.engine';
import { PubSubTokens } from './tokens';

@Module({
  imports: [LogModule],
  controllers: [],
  providers: [
    {
      provide: PubSubTokens.PUBSUB,
      useFactory: (logger: BaseLogger) => new FirestorePubSubEngine(logger),
      inject: [BaseLogger],
    },
  ],
  exports: [PubSubTokens.PUBSUB],
})
export class PubSubModule {}
