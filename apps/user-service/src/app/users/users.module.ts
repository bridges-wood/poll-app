import { Module } from '@nestjs/common';
import { AuthGuardModule, CrossAppAuthModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { UserModelMapper } from './models/user.model-mapper';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, PubSubModule, AuthGuardModule, CrossAppAuthModule],
  providers: [UsersResolver, UsersService, UserModelMapper],
  exports: [UsersService],
})
export class UsersModule {}
