import { Injectable } from '@nestjs/common';
import { KeyLike } from 'jose';

@Injectable()
export abstract class CryptoService {
  public abstract get publicKey(): KeyLike;
  public abstract exportPublicKey(): Promise<string>;
  public abstract exportPrivateKey(): Promise<string>;
}
