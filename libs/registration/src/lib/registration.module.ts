import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@org/config';
import { CrossAppModule } from './cross-app/cross-app.module';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';

@Module({
  imports: [CrossAppModule, ConfigModule],
  providers: [ConfigService, RegistrationResolver, RegistrationService],
  exports: [RegistrationResolver],
})
export class RegistrationModule {}
export * from './registration.service';
