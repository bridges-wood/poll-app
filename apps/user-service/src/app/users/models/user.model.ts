import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { IStoredEntity, USERS_COLLECTION } from '@org/firebase';
import { Connected } from '@org/graphql/pagination';
import { StaticImplements } from '@org/typings';
import { UserDbModel, UserModelMapper } from './user.model-mapper';

@ObjectType({ description: 'A user' })
@Directive('@key(selectionSet: "{ id }")')
@Directive('@canonical')
export class User
  implements StaticImplements<IStoredEntity<User, UserDbModel>, typeof User>
{
  static collectionName = USERS_COLLECTION;
  static modelMapper = UserModelMapper;

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

  @Field((type) => [String], { description: 'The roles the user has' })
  roles: string[];

  @Field({ description: 'The date and time the user was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the user was last updated' })
  updatedAt: Date;
}

@ObjectType()
export class UserConnection extends Connected(User) {}
