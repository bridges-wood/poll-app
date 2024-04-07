import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { CrossAppModule } from 'libs/auth/src/lib/cross-app/cross-app.module';
import { UserModelMapper } from './models/user.model-mapper';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, PubSubModule, AuthGuardModule, CrossAppModule],
  providers: [UsersResolver, UsersService, UserModelMapper],
})
export class UsersModule {}
