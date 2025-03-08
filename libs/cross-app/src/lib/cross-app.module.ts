import { Module } from '@nestjs/common';
import GatewayConfigFactory, {
  GatewayConfig,
} from '@org/config/gateway.config.factory';
import { BaseLogger, LogModule } from '@org/log';
import { GraphQLCrossAppClient } from './clients/graphql.client';
import { CrossAppConfigModule } from './config/cross-app.config.module';

@Module({
  imports: [CrossAppConfigModule, LogModule],
  providers: [
    {
      useFactory: (gatewayConfig: GatewayConfig, logger: BaseLogger) =>
        new GraphQLCrossAppClient(gatewayConfig.url, logger),
      provide: GraphQLCrossAppClient,
      inject: [GatewayConfigFactory.KEY, BaseLogger],
    },
  ],
  exports: [GraphQLCrossAppClient],
})
export class CrossAppModule {}
