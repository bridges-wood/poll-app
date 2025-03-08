import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import GatewayConfigFactory, {
  GatewayConfig,
} from '@org/config/gateway.config.factory';
import { RestCrossAppClient } from '@org/cross-app';
import { CrossAppHealthService } from '@org/health';
import { BaseLogger, LogModule } from '@org/log';
import { CrossAppRegistrationModule } from './cross-app/cross-app.registration.module';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';
import StandaloneConfigFactory from './config/factories/standalone.config.factory';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';

@Module({
  imports: [
    ConfigModule.forFeature(EnvironmentConfigFactory),
    ConfigModule.forFeature(GatewayConfigFactory),
    ConfigModule.forFeature(StandaloneConfigFactory),
    CrossAppRegistrationModule,
    LogModule,
  ],
  providers: [
    RegistrationResolver,
    RegistrationService,
    {
      provide: CrossAppHealthService,
      useFactory(
        gatewayConfig: GatewayConfig,
        innerLogger: BaseLogger,
        outerLogger: BaseLogger,
      ) {
        return new CrossAppHealthService(
          new RestCrossAppClient(gatewayConfig.url, innerLogger),
          outerLogger,
        );
      },
      inject: [GatewayConfigFactory.KEY, BaseLogger, BaseLogger],
    },
  ],
  exports: [RegistrationResolver],
})
export class RegistrationModule {}
