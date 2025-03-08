import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseLogger, LogModule } from '@org/log';
import EndpointsConfigFactory, {
  EndpointsConfig,
} from '../config/factories/endpoints.config.factory';
import { ExecutorFactory } from '../executors/executor-factory';
import { ExecutorsModule } from '../executors/executors.module';
import { EndpointsResolver } from './endpoints.resolver';
import { EndpointsService } from './endpoints.service';
import { EndpointLoader } from './loaders';
import { LocalEndpointLoader } from './loaders/local-endpoint-loader';

@Module({
  imports: [
    ConfigModule.forFeature(EndpointsConfigFactory),
    LogModule,
    ExecutorsModule,
  ],
  providers: [
    EndpointsResolver,
    EndpointsService,
    ExecutorFactory,
    {
      provide: EndpointLoader,
      useFactory: (
        endpointsConfig: EndpointsConfig,
        executorFactory: ExecutorFactory,
        logger: BaseLogger,
      ) => new LocalEndpointLoader(endpointsConfig, executorFactory, logger),
      inject: [EndpointsConfigFactory.KEY, ExecutorFactory, BaseLogger],
    },
  ],
  exports: [EndpointLoader],
})
export class EndpointsModule {}
