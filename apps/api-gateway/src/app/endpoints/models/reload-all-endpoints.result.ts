import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReloadAllEndpointsResult {
  @Field({ description: 'Whether the endpoints were reloaded successfully' })
  success: boolean;
}
