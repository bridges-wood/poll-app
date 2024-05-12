import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType({
  description: 'Post stub',
})
@Directive('@key(selectionSet: "{ id }")')
export class Post {
  @Field((type) => ID, {
    description: 'The ID of the post as it is stored in Firebase',
  })
  id: string;

  @Field({ description: 'The author of the post' })
  author: User;
}
