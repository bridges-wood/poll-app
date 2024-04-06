import { Module } from '@nestjs/common';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppUserService } from './cross-app.user.service';

@Module({
  imports: [CrossAppLibraryModule],
  providers: [CrossAppUserService],
  exports: [CrossAppUserService],
})
export class CrossAppModule {}
export * from './cross-app.user.service';
