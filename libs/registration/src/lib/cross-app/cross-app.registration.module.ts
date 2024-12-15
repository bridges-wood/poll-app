import { Module } from '@nestjs/common';
import { ConfigModule } from '@org/config';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { CrossAppRegistrationService } from './cross-app.registration.service';

@Module({
  imports: [CrossAppLibraryModule, ConfigModule],
  providers: [CrossAppRegistrationService],
  exports: [CrossAppRegistrationService],
})
export class CrossAppRegistrationModule {}
