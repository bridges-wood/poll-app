import { Module } from '@nestjs/common';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppRegistrationService } from './cross-app.registration.service';

@Module({
  imports: [CrossAppLibraryModule],
  providers: [CrossAppRegistrationService],
  exports: [CrossAppRegistrationService],
})
export class CrossAppModule {}
