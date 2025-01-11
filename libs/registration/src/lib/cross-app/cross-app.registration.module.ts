import { Module } from '@nestjs/common';
import { ConfigModule } from '@org/config';
import { CrossAppModule as CrossAppLibraryModule } from '@org/cross-app';
import { LogModule } from '@org/log';
import { CrossAppRegistrationService } from './cross-app.registration.service';

@Module({
  imports: [CrossAppLibraryModule, ConfigModule, LogModule],
  providers: [CrossAppRegistrationService],
  exports: [CrossAppRegistrationService],
})
export class CrossAppRegistrationModule {}
