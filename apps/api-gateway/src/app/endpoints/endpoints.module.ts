import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ExecutorFactory } from '../executors/executor-factory';
import { ExecutorsModule } from '../executors/executors.module';
import { EndpointsResolver } from './endpoints.resolver';
import { EndpointsService } from './endpoints.service';
import { EndpointLoader } from './loaders';
import { LocalEndpointLoader } from './loaders/local-endpoint-loader';

@Module({
  imports: [ConfigModule, ExecutorsModule],
  providers: [
    ConfigService,
    EndpointsResolver,
    EndpointsService,
    ExecutorFactory,
    {
      provide: EndpointLoader,
      useFactory: (
        configService: ConfigService,
        executorFactory: ExecutorFactory,
      ) => new LocalEndpointLoader(configService, executorFactory),
      inject: [ConfigService, ExecutorFactory],
    },
  ],
  exports: [EndpointLoader],
})
export class EndpointsModule {}
