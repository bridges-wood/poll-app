import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { GraphQLCrossAppClient } from './clients/graphql.client';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      useFactory: (configService: ClientConfigService) =>
        new GraphQLCrossAppClient(configService.gatewayUrl), 
      provide: GraphQLCrossAppClient,
      inject: [ClientConfigService],
    },
  ],
  exports: [GraphQLCrossAppClient],
})
export class CrossAppModule {}
