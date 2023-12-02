import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserArgs {
  @Field()
  displayName: string;
}
