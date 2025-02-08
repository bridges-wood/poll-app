import { Module, forwardRef } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { LogModule } from '@org/log';
import { PubSubModule } from '@org/pubsub';
import { UsersModule } from '../users/users.module';
import { Post } from './models/post.model';
import { PostModelMapper } from './models/post.model-mapper';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    FirebaseModule.forFeature({
      providers: [PostModelMapper],
      entities: [Post],
    }),
    PubSubModule,
    AuthGuardModule,
    forwardRef(() => UsersModule),
    LogModule,
  ],
  providers: [PostsResolver, PostsService, PostModelMapper],
  exports: [PostsService, PostModelMapper],
})
export class PostsModule {}
