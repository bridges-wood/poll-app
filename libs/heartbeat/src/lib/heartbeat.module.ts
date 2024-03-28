import { Module } from '@nestjs/common';
import { HeartbeatResolver } from './heartbeat.resolver';

@Module({
  controllers: [],
  providers: [HeartbeatResolver],
  exports: [HeartbeatResolver],
})
export class HeartbeatModule {}
