import { Module } from '@nestjs/common';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { UserModelMapper } from './models/user.model-mapper';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, PubSubModule],
  providers: [UsersResolver, UsersService, UserModelMapper],
})
export class UsersModule {}
