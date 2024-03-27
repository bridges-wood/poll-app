import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddEndpointArgs {
  @Field({
    description:
      "The unique URL of the GraphQL endpoint to add. Usually ends in '/graphql'",
  })
  url: string;

  @Field({
    nullable: true,
    description: 'The name of the endpoint',
  })
  name?: string;

  @Field({ nullable: true, description: 'A description of the endpoint' })
  description?: string;
}
