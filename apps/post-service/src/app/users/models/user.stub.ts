import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field((type) => [Post], { description: 'All posts created by the user' })
  posts: Post[];
}
