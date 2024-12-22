import { Module } from '@nestjs/common';
import { ClientConfigService, ConfigModule } from '@org/config';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { DynamicCryptoService } from './dynamic.crypto.service';
import { JwtConfigService } from './jwt.config.service';
import { LocalCryptoService } from './local.crypto.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CryptoService,
      inject: [ClientConfigService],
      useFactory: (config: ClientConfigService) => {
        if (config.isDev()) {
          return new LocalCryptoService();
        } else {
          return new DynamicCryptoService();
        }
      },
    },
    JwtConfigService,
  ],
  exports: [CryptoService, JwtConfigService],
  controllers: [CryptoController],
})
export class CryptoModule {}
