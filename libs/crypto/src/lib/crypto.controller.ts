import { Controller, Get } from '@nestjs/common';
import { exportJWK } from 'jose';
import { CryptoService } from './crypto.service';

@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('.well-known/jwks.json')
  public async getJwks() {
    return {
      keys: [await exportJWK(this.cryptoService.publicKey)],
    };
  }
}
