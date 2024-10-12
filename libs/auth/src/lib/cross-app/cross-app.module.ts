import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppAuthService } from './cross-app.auth.service';
import { CrossAppUserService } from './cross-app.user.service';

@Module({
  imports: [
    CrossAppLibraryModule,
    JwtModule.register({}),
    CacheModule.register(),
  ],
  providers: [CrossAppAuthService, CrossAppUserService],
  exports: [CrossAppAuthService, CrossAppUserService],
})
export class CrossAppModule {}
