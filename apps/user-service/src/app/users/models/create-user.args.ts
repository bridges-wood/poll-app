import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserArgs {
  @Field({ description: "The user's display name" })
  displayName: string;
  @Field({ description: "The user's email address" })
  email: string;
  @Field({
    nullable: true,
    description: "The user's URL pointing to the user's profile picture",
  })
  photoURL: string | null;
}
