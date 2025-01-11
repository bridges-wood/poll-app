import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { RestCrossAppClient } from '@org/cross-app';
import { CrossAppHealthService } from '@org/health';
import { BaseLogger, LogModule } from '@org/log';
import { CrossAppRegistrationModule } from './cross-app/cross-app.registration.module';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';

@Module({
  imports: [CrossAppRegistrationModule, ConfigModule, LogModule],
  providers: [
    RegistrationResolver,
    RegistrationService,
    {
      provide: CrossAppHealthService,
      useFactory(
        clientConfigService: ClientConfigService,
        innerLogger: BaseLogger,
        outerLogger: BaseLogger,
      ) {
        return new CrossAppHealthService(
          new RestCrossAppClient(clientConfigService.gatewayUrl, innerLogger),
          outerLogger,
        );
      },
      inject: [ClientConfigService, BaseLogger, BaseLogger],
    },
  ],
  exports: [RegistrationResolver],
})
export class RegistrationModule {}
