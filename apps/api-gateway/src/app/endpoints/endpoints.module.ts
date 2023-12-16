import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { EndpointLoader } from './endpoint-loader';
import { EndpointsResolver } from './endpoints.resolver';
import { EndpointsService } from './endpoints.service';

@Module({
  imports: [ConfigModule],
  providers: [EndpointsResolver, EndpointsService, EndpointLoader],
  exports: [EndpointLoader],
})
export class EndpointsModule {}
