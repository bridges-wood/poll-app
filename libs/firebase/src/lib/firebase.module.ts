import { Module } from '@nestjs/common';
import { auth, database } from './firebase';
import { FirebaseTokens } from './tokens';

@Module({
  controllers: [],
  providers: [
    {
      provide: FirebaseTokens.DATABASE,
      useValue: database,
    },
    {
      provide: FirebaseTokens.AUTH,
      useValue: auth,
    },
  ],
  exports: [FirebaseTokens.DATABASE, FirebaseTokens.AUTH],
})
export class FirebaseModule {}
