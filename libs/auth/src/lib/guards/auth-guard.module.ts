import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@org/cache';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';
import { LogModule } from '@org/log';
import { AuthConfigFactory } from '../config';
import { CrossAppAuthModule } from '../cross-app/cross-app.auth.module';
import { DistributedStrategy } from '../strategies/distributed.strategy';
import { DistributedAuthGuard } from './distributed-auth.guard';
import { OwnershipGuard } from './ownership.guard';
import { ResourceOwnershipRegistry } from './resource-ownership.registry';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule.forFeature(AuthConfigFactory),
    ConfigModule.forFeature(EnvironmentConfigFactory),
    CrossAppAuthModule,
    PassportModule,
    JwtModule.register({}),
    CacheModule,
    LogModule,
  ],
  providers: [
    RolesGuard,
    DistributedAuthGuard,
    DistributedStrategy,
    OwnershipGuard,
    ResourceOwnershipRegistry,
  ],
  exports: [
    RolesGuard,
    DistributedAuthGuard,
    DistributedStrategy,
    OwnershipGuard,
    ResourceOwnershipRegistry,
  ],
})
export class AuthGuardModule {}
