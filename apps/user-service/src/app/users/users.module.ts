import { Module } from '@nestjs/common';
import { FirebaseModule } from '@org/firebase';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { UserModelMapper } from './models/user.model-mapper';

@Module({
  imports: [FirebaseModule],
  providers: [UsersResolver, UsersService, UserModelMapper],
})
export class UsersModule {}
