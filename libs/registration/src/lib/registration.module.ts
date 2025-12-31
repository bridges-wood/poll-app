import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import GatewayConfigFactory, {
  GatewayConfig,
} from '@org/config/gateway.config.factory';
import { GraphQLCrossAppClient, RestCrossAppClient } from '@org/cross-app';
import { CrossAppHealthService } from '@org/health';
import { BaseLogger, LogModule } from '@org/log';
import StandaloneConfigFactory from './config/factories/standalone.config.factory';
import { CrossAppRegistrationModule } from './cross-app/cross-app.registration.module';
import { RegistrationResolver } from './registration.resolver';
import { RegistrationService } from './registration.service';

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
        environmentConfig: EnvironmentConfig,
        restLogger: BaseLogger,
        graphqlLogger: BaseLogger,
        outerLogger: BaseLogger,
      ) {
        return new CrossAppHealthService(
          environmentConfig,
          new RestCrossAppClient(gatewayConfig.url, restLogger),
          new GraphQLCrossAppClient(gatewayConfig.url, graphqlLogger),
          outerLogger,
        );
      },
      inject: [
        GatewayConfigFactory.KEY,
        EnvironmentConfigFactory.KEY,
        BaseLogger,
        BaseLogger,
        BaseLogger,
      ],
    },
  ],
  exports: [RegistrationResolver],
})
export class RegistrationModule {}
