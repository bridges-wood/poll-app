import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Post as PostType } from '@org/typings';
import { User } from '../../users/models/user.model';

@ObjectType({ description: 'post' })
@Directive('@key(selectionSet: "{ id }")')
export class Post implements PostType {
  @Field((type) => ID)
  id: string;

  //   @Field()
  //   question: Question;

  @Field()
  caption: string;

  @Field((type) => User)
  author: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  //   @Field((type) => [Comment])
  //   comments: Comment[];
}
