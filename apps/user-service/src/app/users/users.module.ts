import { Module } from '@nestjs/common';
import { AuthGuardModule, CrossAppAuthModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { LogModule } from '@org/log';
import { PubSubModule } from '@org/pubsub';
import { UserModelMapper } from './models/user.model-mapper';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    FirebaseModule,
    PubSubModule,
    AuthGuardModule,
    CrossAppAuthModule,
    LogModule,
  ],
  providers: [UsersResolver, UsersService, UserModelMapper],
  exports: [UsersService],
})
export class UsersModule {}
