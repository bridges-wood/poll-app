import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { BaseLogger, LogModule } from '@org/log';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { DynamicCryptoService } from './dynamic.crypto.service';
import { JwtConfigService } from './jwt.config.service';
import { LocalCryptoService } from './local.crypto.service';

@Module({
  imports: [ConfigModule, LogModule],
  providers: [
    {
      provide: CryptoService,
      inject: [ClientConfigService, BaseLogger],
      useFactory: (config: ClientConfigService, logger: BaseLogger) => {
        if (config.isDev()) {
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
