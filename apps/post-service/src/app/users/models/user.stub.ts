import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';

@ObjectType({ description: 'Stub user' })
export class User {
  @Field((type) => ID, {
    description: 'The ID of the user as it is stored in Firebase',
  })
  id: string;

  @Field((type) => [Post], { description: 'All posts created by the user' })
  posts: Post[];
}
