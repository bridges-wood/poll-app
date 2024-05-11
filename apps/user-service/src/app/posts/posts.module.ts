import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { CrossAppModule } from '@org/cross-app';
import { FirebaseModule } from '@org/firebase';
import { UsersModule } from '../users/users.module';
import { PostModelMapper } from './models/post.model-mapper';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [FirebaseModule, AuthGuardModule, CrossAppModule, UsersModule],
  providers: [PostsResolver, PostsService, PostModelMapper],
})
export class PostsModule {}
