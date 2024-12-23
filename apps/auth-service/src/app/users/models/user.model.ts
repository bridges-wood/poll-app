import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Stub user' })
export class User {
  @Field((type) => ID, {
    description: 'The ID of the user as it is stored in Firebase',
  })
  id: string;

  @Field({ description: 'The email address of the user' })
  email: string;

  @Field((type) => [String], { description: 'The roles the user has' })
  roles: string[];
}
