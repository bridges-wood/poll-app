import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly cryptoService: CryptoService) {}

  async createJwtOptions(): Promise<JwtModuleOptions> {
    return {
      signOptions: {
        algorithm: 'PS256',
      },
      publicKey: await this.cryptoService.exportPublicKey(),
      privateKey: await this.cryptoService.exportPrivateKey(),
    };
  }
}
