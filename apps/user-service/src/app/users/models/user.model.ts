import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';
import { User as UserType } from '@org/typings';

@ObjectType({ description: 'A user' })
@Directive('@key(selectionSet: "{ id }")')
@Directive('@canonical')
export class User implements UserType {
  @Field((type) => ID, {
    description: 'The ID of the user as it is stored in Firebase',
  })
  id: string;

  @Field({ description: 'The email address of the user' })
  email: string;

  @Field({ description: 'The name of the user as is displayed to others' })
  displayName: string;

  @Field({
    nullable: true,
    description: "The URL of the user's profile picture",
  })
  profilePicture?: string;

  @Field({ nullable: true, description: "The user's first name" })
  firstName?: string;

  @Field({ nullable: true, description: "The user's last name" })
  lastName?: string;

  @Field((type) => [Post], { description: 'All posts created by the user' })
  posts: Post[];

  @Field({ description: 'The date and time the user was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the user was last updated' })
  updatedAt: Date;
}
