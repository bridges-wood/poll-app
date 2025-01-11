import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@org/cache';
import { LogModule } from '@org/log';
import { CrossAppAuthModule } from '../cross-app/cross-app.auth.module';
import { DistributedStrategy } from '../strategies/distributed.strategy';
import { DistributedAuthGuard } from './distributed-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    CrossAppAuthModule,
    PassportModule,
    JwtModule.register({}),
    CacheModule,
    LogModule,
  ],
  providers: [RolesGuard, DistributedAuthGuard, DistributedStrategy],
  exports: [RolesGuard, DistributedAuthGuard, DistributedStrategy],
})
export class AuthGuardModule {}
