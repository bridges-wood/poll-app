import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
@Directive('@key(selectionSet: "{ id }")')
export class Post {
  @Field((type) => ID)
  id: string;

  @Field({ description: 'The author of the post' })
  author: User;
}
