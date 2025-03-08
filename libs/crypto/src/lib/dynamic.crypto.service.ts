import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import * as jose from 'jose';
import { CryptoService } from './crypto.service';

@Injectable()
export class DynamicCryptoService implements CryptoService {
  public readonly alg: string;
  private _publicKey!: jose.KeyLike;
  private _privateKey!: jose.KeyLike;

  constructor(private readonly logger: BaseLogger) {
    this.logger.setContext(DynamicCryptoService.name);
    this.alg = 'PS256';
  }

  private async generateKeyPair() {
    const keyPair = await jose.generateKeyPair(this.alg, {
      extractable: true,
    });
    this.logger.debug(`Successfully generated key pair with alg:${this.alg}`);
    this._publicKey = keyPair.publicKey;
    this._privateKey = keyPair.privateKey;
  }

  private async generateKeysIfUndefined() {
    if (!this._publicKey || !this._privateKey) {
      this.logger.debug('Key pair not set, generating new key pair...');
      await this.generateKeyPair();
    }
    this.logger.debug('Key pair already set, using existing key pair');
  }

  public get publicKey() {
    if (!this._publicKey) {
      throw new Error('Public key not set');
    }
    return this._publicKey;
  }

  public async exportPublicKey() {
    await this.generateKeysIfUndefined();
    return jose.exportSPKI(this._publicKey);
  }

  public async exportPrivateKey() {
    await this.generateKeysIfUndefined();
    return jose.exportPKCS8(this._privateKey);
  }
}
