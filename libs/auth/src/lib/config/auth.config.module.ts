import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EnvironmentConfigFactory from '@org/config/environment.config.factory';
import { AuthConfigFactory } from '.';

const ConfigModules: DynamicModule[] = [
  ConfigModule.forFeature(AuthConfigFactory),
  ConfigModule.forFeature(EnvironmentConfigFactory),
];

@Module({
  imports: ConfigModules,
  exports: ConfigModules,
})
export class AuthConfigModule {}
