import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@org/cache';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppAuthService } from './cross-app.auth.service';
import { CrossAppUserService } from './cross-app.user.service';

@Module({
  imports: [CacheModule, CrossAppLibraryModule, JwtModule.register({})],
  providers: [CrossAppAuthService, CrossAppUserService],
  exports: [CrossAppAuthService, CrossAppUserService],
})
export class CrossAppModule {}
