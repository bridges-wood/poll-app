import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import GatewayConfigFactory from '@org/config/gateway.config.factory';

const ConfigModules: DynamicModule[] = [
  ConfigModule.forFeature(GatewayConfigFactory),
];

@Module({
  imports: ConfigModules,
  exports: ConfigModules,
})
export class CrossAppConfigModule {}
