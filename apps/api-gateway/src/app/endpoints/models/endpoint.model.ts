import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'An endpoint to be loaded into the API Gateway',
  isAbstract: true,
  inheritDescription: true,
})
export abstract class Endpoint {
  @Field({ description: 'The URL of the endpoint' })
  url: string;

  @Field({
    nullable: true,
    description: 'The name of the service exposed by the endpoint',
  })
  name?: string;

  @Field({ nullable: true, description: 'A description of the endpoint' })
  description?: string;
}

export const isEndpoint = (obj: unknown): obj is Endpoint => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Endpoint).url === 'string'
  );
};
