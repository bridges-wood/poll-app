import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'A service accessible by the API Gateway',
})
export class Endpoint {
  @Field({
    description:
      'Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details.',
  })
  name!: string;

  @Field({
    description:
      'A hash denoting the version of the service. Must be a valid SHA256 hash.',
  })
  hash!: string;

  @Field({
    description:
      'The root URL of the service, e.g. "http://localhost:3000". Must be a valid URL.',
  })
  url!: string;

  @Field({
    description:
      'The URL of the JWKS endpoint for the service. Must be a valid URL.',
    nullable: true,
  })
  jwksUri?: string;
}
