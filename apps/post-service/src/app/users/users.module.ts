import { Module, forwardRef } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PostsModule } from '../posts/posts.module';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, AuthGuardModule, forwardRef(() => PostsModule)],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
