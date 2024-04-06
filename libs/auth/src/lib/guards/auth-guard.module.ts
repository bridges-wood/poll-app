import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CrossAppModule } from '../cross-app/cross-app.module';
import { DistributedStrategy } from '../strategies/distributed.strategy';
import { AuthGuard } from './auth.guard';
import { DistributedAuthGuard } from './distributed-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [CrossAppModule, PassportModule],
  providers: [AuthGuard, RolesGuard, DistributedAuthGuard, DistributedStrategy],
  exports: [AuthGuard, RolesGuard, DistributedAuthGuard, DistributedStrategy],
})
export class AuthGuardModule {}
