import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '@org/auth';
import { HeartbeatService } from './heartbeat.service';
import { Heartbeat } from './models/heartbeat.model';

@Resolver()
export class HeartbeatResolver {
  constructor(private readonly heartbeatService: HeartbeatService) {}

  @Public()
  @Query((returns) => Heartbeat, {
    description: 'Provides health data on the service',
  })
  async _heartbeat(): Promise<Heartbeat> {
    return this.heartbeatService.getHeartbeat();
  }
}
