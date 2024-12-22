import { KeyLike } from 'jose';

export abstract class CryptoService {
  public abstract get publicKey(): KeyLike;
  public abstract exportPublicKey(): Promise<string>;
  public abstract exportPrivateKey(): Promise<string>;
}
