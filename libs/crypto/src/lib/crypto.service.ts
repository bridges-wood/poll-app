import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CryptoService {
  public abstract get publicKey(): CryptoKey;
  public abstract exportPublicKey(): Promise<string>;
  public abstract exportPrivateKey(): Promise<string>;
}
