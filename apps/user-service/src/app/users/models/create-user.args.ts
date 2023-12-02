import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserArgs {
  @Field()
  displayName: string;
  @Field()
  email: string;
  @Field({ nullable: true })
  photoURL: string | null;
}
