import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'A user' })
export class User {
  @Field((type) => ID, {
    description: 'The ID of the user as it is stored in Firebase',
  })
  id: string;

  @Field({ description: 'The email address of the user' })
  email: string;
}
