import { Injectable } from '@nestjs/common';
import { Heartbeat, ServiceStatus } from './models/heartbeat.model';

@Injectable()
export class HeartbeatService {
  getHeartbeat(): Heartbeat {
    return {
      status: ServiceStatus.OK, // TODO - implement logic to determine status
      time: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}
