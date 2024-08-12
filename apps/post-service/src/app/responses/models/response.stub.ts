import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';

@ObjectType({ description: 'Stub post response' })
export class Response {
  @Field({ description: 'The ID of the response' })
  id: string;

  @Field((type) => Post, {
    description: 'The post that the response relates to',
  })
  post: Post;
}
