import { Module } from '@nestjs/common';
import { database } from './firebase';
import { FirebaseTokens } from './tokens';

@Module({
  controllers: [],
  providers: [
    {
      provide: FirebaseTokens.DATABASE,
      useValue: database,
    },
  ],
  exports: [FirebaseTokens.DATABASE],
})
export class FirebaseModule {}
