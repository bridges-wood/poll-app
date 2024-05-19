import { Module, forwardRef } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { UsersModule } from '../users/users.module';
import { PostModelMapper } from './models/post.model-mapper';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    FirebaseModule,
    PubSubModule,
    AuthGuardModule,
    forwardRef(() => UsersModule),
  ],
  providers: [PostsResolver, PostsService, PostModelMapper],
  exports: [PostModelMapper, PostsService],
})
export class PostsModule {}
