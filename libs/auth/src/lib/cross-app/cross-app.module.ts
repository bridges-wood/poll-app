import { Module } from '@nestjs/common';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppAuthService } from './cross-app.auth.service';
import { CrossAppUserService } from './cross-app.user.service';

@Module({
  imports: [CrossAppLibraryModule],
  providers: [CrossAppAuthService, CrossAppUserService],
  exports: [CrossAppAuthService, CrossAppUserService],
})
export class CrossAppModule {}
