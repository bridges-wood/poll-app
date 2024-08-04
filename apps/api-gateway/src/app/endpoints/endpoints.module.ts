import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { EndpointsResolver } from './endpoints.resolver';
import { EndpointsService } from './endpoints.service';
import { EndpointLoader } from './loaders';
import { LocalEndpointLoader } from './loaders/local-endpoint-loader';

@Module({
  imports: [ConfigModule],
  providers: [
    EndpointsResolver,
    EndpointsService,
    {
      provide: EndpointLoader,
      useFactory: (configService: ConfigService) =>
        new LocalEndpointLoader(configService),
      inject: [ConfigService],
    },
  ],
  exports: [EndpointLoader],
})
export class EndpointsModule {}
