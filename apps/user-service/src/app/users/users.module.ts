import { Module } from '@nestjs/common';
import { AuthGuardModule, CrossAppAuthModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { LogModule } from '@org/log';
import { PubSubModule } from '@org/pubsub';
import { User } from './models/user.model';
import { UserModelMapper } from './models/user.model-mapper';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    FirebaseModule.forFeature({
      providers: [UserModelMapper],
      entities: [User],
    }),
    PubSubModule,
    AuthGuardModule,
    CrossAppAuthModule,
    LogModule,
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
