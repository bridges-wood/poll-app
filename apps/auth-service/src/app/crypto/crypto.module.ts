import { Module } from '@nestjs/common';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { JwtConfigService } from './jwt.config.service';

@Module({
  providers: [CryptoService, JwtConfigService],
  exports: [CryptoService, JwtConfigService],
  controllers: [CryptoController],
})
export class CryptoModule {}
