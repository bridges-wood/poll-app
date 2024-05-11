import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PostsModule } from '../posts/posts.module';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, AuthGuardModule, PostsModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
