import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EnvironmentConfigFactory, {
  EnvironmentConfig,
} from '@org/config/environment.config.factory';
import { BaseLogger, LogModule } from '@org/log';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { DynamicCryptoService } from './dynamic.crypto.service';
import { JwtConfigService } from './jwt.config.service';
import { LocalCryptoService } from './local.crypto.service';

@Module({
  imports: [ConfigModule.forFeature(EnvironmentConfigFactory), LogModule],
  providers: [
    {
      provide: CryptoService,
      inject: [EnvironmentConfigFactory.KEY, BaseLogger],
      useFactory: (
        environmentConfig: EnvironmentConfig,
        logger: BaseLogger,
      ) => {
        if (environmentConfig.isDev()) {
          return new LocalCryptoService(logger);
        } else {
          return new DynamicCryptoService(logger);
        }
      },
    },
    JwtConfigService,
  ],
  exports: [CryptoService, JwtConfigService],
  controllers: [CryptoController],
})
export class CryptoModule {}
