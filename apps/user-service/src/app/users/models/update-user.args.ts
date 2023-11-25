import { Field, InputType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';
import { User } from './user.model';

@InputType()
export class UpdateUserArgs
  implements Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
{
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  posts?: Post[];
}
