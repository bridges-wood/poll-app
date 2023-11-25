import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';

export interface UserAuthData {
  id: string;
  email: string | null;
  displayName: string | null;
}

@ObjectType()
@Directive('@key(fields: "id")')
export class User implements UserAuthData {
  @Field((type) => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field((type) => [Post])
  posts: Post[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
