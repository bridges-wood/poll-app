import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserArgs {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
}
