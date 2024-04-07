import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResult {
  @Field((type) => String, {
    description:
      'The token containing the user ID and the authentication method.',
  })
  token: string;
}
