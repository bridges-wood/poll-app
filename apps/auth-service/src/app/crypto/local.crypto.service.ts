import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as jose from 'jose';
import { KeyLike } from 'jose';
import { join } from 'path';
import { CryptoService } from './crypto.service';

@Injectable()
export class LocalCryptoService implements CryptoService {
  public readonly alg: string;
  protected readonly logger = new Logger(LocalCryptoService.name);
  private _publicKey: jose.KeyLike;
  private _privateKey: jose.KeyLike;

  constructor() {
    this.alg = 'PS256';
  }

  private async setupKeysIfUndefined() {
    if (!this._publicKey || !this._privateKey) {
      await this.loadKeyPairFromFile();

      // Check if stored keys are available
      if (!this._publicKey || !this._privateKey) {
        this.logger.debug('Key pair not set, generating new key pair...');
        await this.generateKeyPair();
        await this.exportKeyPairToFile();
      }
    }
  }

  private async exportKeyPairToFile() {
    // Check if assets/auth directory exists
    if (!existsSync(join(__dirname, 'assets/auth'))) {
      this.logger.debug('Creating assets/auth directory');
      mkdirSync(join(__dirname, 'assets/auth'), { recursive: true });
    }

    writeFileSync(
      join(__dirname, 'assets/auth/public-key.pem'),
      await jose.exportSPKI(this._publicKey),
    );
    writeFileSync(
      join(__dirname, 'assets/auth/private-key.pem'),
      await jose.exportPKCS8(this._privateKey),
    );
  }

  private async loadKeyPairFromFile() {
    this.logger.debug('Loading key pair from files...');
    const publicKeyFilePath = join(__dirname, 'assets/auth/public-key.pem');
    const privateKeyFilePath = join(__dirname, 'assets/auth/private-key.pem');
    if (!existsSync(publicKeyFilePath) || !existsSync(privateKeyFilePath)) {
      this.logger.debug('Key pair files not found');
      return;
    }

    const publicKeyFile = readFileSync(publicKeyFilePath);
    const privateKeyFile = readFileSync(privateKeyFilePath);

    this._publicKey = await jose.importSPKI(publicKeyFile.toString(), this.alg);
    this._privateKey = await jose.importPKCS8(
      privateKeyFile.toString(),
      this.alg,
    );
    this.logger.debug('Successfully loaded key pair from files');
  }

  private async generateKeyPair() {
    const keyPair = await jose.generateKeyPair(this.alg, {
      extractable: true,
    });
    this.logger.debug(`Successfully generated key pair with alg:${this.alg}`);
    this._publicKey = keyPair.publicKey;
    this._privateKey = keyPair.privateKey;
  }

  public get publicKey(): KeyLike {
    if (!this._publicKey) {
      throw new Error('Public key not set');
    }
    return this._publicKey;
  }

  public async exportPublicKey(): Promise<string> {
    await this.setupKeysIfUndefined();
    return jose.exportSPKI(this._publicKey);
  }

  public async exportPrivateKey(): Promise<string> {
    await this.setupKeysIfUndefined();
    return jose.exportPKCS8(this._privateKey);
  }
}
