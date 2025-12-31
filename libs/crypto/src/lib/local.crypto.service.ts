import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import assert from 'assert';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import {
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importPKCS8,
  importSPKI,
} from 'jose';
import { join } from 'path';
import { CryptoService } from './crypto.service';

@Injectable()
export class LocalCryptoService implements CryptoService {
  public readonly alg: string;
  private _publicKey: CryptoKey | undefined;
  private _privateKey: CryptoKey | undefined;

  constructor(private readonly logger: BaseLogger) {
    this.logger.setContext(LocalCryptoService.name);
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
    assert(this._publicKey, 'Public key is not set');
    assert(this._privateKey, 'Private key is not set');

    // Check if assets/auth directory exists
    if (!existsSync(join(__dirname, 'assets/auth'))) {
      this.logger.debug('Creating assets/auth directory');
      mkdirSync(join(__dirname, 'assets/auth'), { recursive: true });
    }

    writeFileSync(
      join(__dirname, 'assets/auth/public-key.pem'),
      await exportSPKI(this._publicKey),
    );
    writeFileSync(
      join(__dirname, 'assets/auth/private-key.pem'),
      await exportPKCS8(this._privateKey),
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

    this._publicKey = await importSPKI(publicKeyFile.toString(), this.alg);
    this._privateKey = await importPKCS8(privateKeyFile.toString(), this.alg, {
      extractable: true,
    });
    this.logger.debug('Successfully loaded key pair from files');
  }

  private async generateKeyPair() {
    const keyPair = await generateKeyPair(this.alg, {
      extractable: true,
    });
    this.logger.debug(`Successfully generated key pair with alg:${this.alg}`);
    this._publicKey = keyPair.publicKey;
    this._privateKey = keyPair.privateKey;
  }

  public get publicKey(): CryptoKey {
    if (!this._publicKey) {
      throw new Error('Public key not set');
    }
    return this._publicKey;
  }

  public async exportPublicKey(): Promise<string> {
    await this.setupKeysIfUndefined();
    assert(this._publicKey, 'Public key was not set');

    return exportSPKI(this._publicKey);
  }

  public async exportPrivateKey(): Promise<string> {
    await this.setupKeysIfUndefined();
    assert(this._privateKey, 'Private key was not set');

    return exportPKCS8(this._privateKey);
  }
}
