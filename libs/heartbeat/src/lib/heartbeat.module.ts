import { Module } from '@nestjs/common';
import { HeartbeatResolver } from './heartbeat.resolver';
import { HeartbeatService } from './heartbeat.service';

@Module({
  controllers: [],
  providers: [HeartbeatResolver, HeartbeatService],
  exports: [HeartbeatResolver],
})
export class HeartbeatModule {}
