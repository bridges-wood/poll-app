import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@org/config';
import { GraphQLCrossAppClient } from './clients/graphql.client';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      useFactory: (configService: ConfigService) =>
        new GraphQLCrossAppClient(configService.gatewayUrl), // TODO - think about accessing individual services to reduce load on the gateway
      provide: GraphQLCrossAppClient,
      inject: [ConfigService],
    },
  ],
  exports: [GraphQLCrossAppClient],
})
export class CrossAppModule {}
