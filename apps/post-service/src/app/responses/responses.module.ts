import { forwardRef, Module } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { PostsModule } from '../posts/posts.module';
import { ResponsesResolver } from './responses.resolver';

@Module({
  imports: [
    FirebaseModule,
    PubSubModule,
    AuthGuardModule,
    forwardRef(() => PostsModule),
  ],
  providers: [ResponsesResolver],
})
export class ResponsesModule {}
