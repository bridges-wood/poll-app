import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CrossAppAuthModule } from '../cross-app/cross-app.auth.module';
import { DistributedStrategy } from '../strategies/distributed.strategy';
import { AuthGuard } from './auth.guard';
import { DistributedAuthGuard } from './distributed-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [CrossAppAuthModule, PassportModule],
  providers: [AuthGuard, RolesGuard, DistributedAuthGuard, DistributedStrategy],
  exports: [AuthGuard, RolesGuard, DistributedAuthGuard, DistributedStrategy],
})
export class AuthGuardModule {}
