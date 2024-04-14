import { Field, InputType } from '@nestjs/graphql';
import { User } from './user.model';

@InputType()
export class UpdateUserArgs
  implements Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
{
  @Field({ nullable: true, description: "The user's email address" })
  email?: string;

  @Field({ nullable: true, description: "The user's display name" })
  displayName?: string;

  @Field({ nullable: true, description: "The user's first name" })
  firstName?: string;

  @Field({ nullable: true, description: "The user's last name" })
  lastName?: string;

  // TODO add posts
  // @Field({ nullable: true, description: "A list of the user's posts" })
  // posts?: Post[];
}
