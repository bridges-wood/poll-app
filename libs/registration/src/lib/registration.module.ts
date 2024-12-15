import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { RestCrossAppClient } from '@org/cross-app';
import { CrossAppHealthService } from '@org/health';
import { CrossAppRegistrationModule } from './cross-app/cross-app.registration.module';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';

@Module({
  imports: [CrossAppRegistrationModule, ConfigModule],
  providers: [
    ClientConfigService,
    RegistrationResolver,
    RegistrationService,
    {
      provide: CrossAppHealthService,
      inject: [ClientConfigService],
      useFactory(clientConfigService: ClientConfigService) {
        return new CrossAppHealthService(
          new RestCrossAppClient(clientConfigService.gatewayUrl),
        );
      },
    },
  ],
  exports: [RegistrationResolver],
})
export class RegistrationModule {}
export * from './registration.service';
