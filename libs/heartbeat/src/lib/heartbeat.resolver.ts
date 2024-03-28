import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HeartbeatResolver {
  @Query((returns) => String)
  async heartbeat(): Promise<string> {
    return 'thump thump';
  }
}
