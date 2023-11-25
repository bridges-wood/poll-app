import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType({ description: 'post' })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Post {
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
