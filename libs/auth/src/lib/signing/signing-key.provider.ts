import { GetSigningKeyFunction } from '@graphql-yoga/plugin-jwt';

export abstract class SigningKeyProvider {
  public abstract build(): GetSigningKeyFunction;
}
