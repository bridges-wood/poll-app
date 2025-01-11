import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@org/cache';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { LogModule } from '@org/log';
import { CrossAppAuthService } from './cross-app.auth.service';

@Module({
  imports: [
    CacheModule,
    CrossAppLibraryModule,
    JwtModule.register({}),
    LogModule,
  ],
  providers: [CrossAppAuthService],
  exports: [CrossAppAuthService],
})
export class CrossAppAuthModule {}
