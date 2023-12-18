import { Directive, Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'The data that is returned when a user logs in' })
@Directive('@key(selectionSet: "{ id }")')
export class UserAuthData {
  @Field({ description: 'The ID of the user as it is stored in Firebase' })
  id: string;

  @Field({ description: 'The email address of the user', nullable: true })
  email?: string;

  @Field({
    description: 'The name of the user as is displayed to others',
    nullable: true,
  })
  displayName?: string;
}
