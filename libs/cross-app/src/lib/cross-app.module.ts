import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { BaseLogger, LogModule } from '@org/log';
import { GraphQLCrossAppClient } from './clients/graphql.client';

@Module({
  imports: [ConfigModule, LogModule],
  providers: [
    {
      useFactory: (configService: ClientConfigService, logger: BaseLogger) =>
        new GraphQLCrossAppClient(configService.gatewayUrl, logger),
      provide: GraphQLCrossAppClient,
      inject: [ClientConfigService, BaseLogger],
    },
  ],
  exports: [GraphQLCrossAppClient],
})
export class CrossAppModule {}
