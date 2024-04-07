import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseTokens } from '@org/firebase';
import { DecodedIdToken, User } from '@org/typings';
import {
  Auth,
  GoogleAuthProvider,
  OAuthCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { CrossAppUserService } from '../cross-app/cross-app.user.service';
import { SupportedOAuthProvider } from './supported-oauth-providers';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private crossAppUserService: CrossAppUserService,
    @Inject(FirebaseTokens.AUTH) private firebaseAuth: Auth,
  ) {}

  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<string> {
    const cred = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    );

    return this.generateUserToken({ id: cred.user.uid }, ['pwd']);
  }

  async signInWithOAuthToken(
    token: string,
    provider: SupportedOAuthProvider,
  ): Promise<string> {
    const authCred = this.exchangeOAuthTokenForCredential(token, provider);
    const userCred = await signInWithCredential(this.firebaseAuth, authCred);

    return this.generateUserToken({ id: userCred.user.uid }, [provider]);
  }

  private exchangeOAuthTokenForCredential(
    token: string,
    provider: SupportedOAuthProvider,
  ): OAuthCredential {
    switch (provider) {
      case 'google':
        return GoogleAuthProvider.credential(token);
      default:
        throw new Error('Unsupported OAuth provider');
    }
  }

  async refreshToken(token: string): Promise<string> {
    const decoded = await this.validateToken(token);
    return this.generateUserToken({ id: decoded.sub }, decoded.amr);
  }

  async validateToken(token: string): Promise<DecodedIdToken> {
    this.logger.debug(`Validating token: ${token}`);
    return this.jwtService.verify(token);
  }

  async generateUserToken(
    user: Pick<User, 'id'>,
    authMethods: string[],
  ): Promise<string> {
    const payload: Pick<DecodedIdToken, 'iss' | 'sub' | 'aud' | 'amr'> = {
      iss: `https://${process.env['DOMAIN'] || 'localhost'}/`,
      sub: user.id,
      aud: process.env['CLIENT_ID'] || 'clientId',
      amr: authMethods,
    };
    return this.jwtService.sign(payload);
  }

  async generateCrossAppToken(): Promise<string> {
    const payload: Pick<DecodedIdToken, 'iss' | 'sub' | 'aud' | 'amr'> = {
      iss: `https://${process.env['DOMAIN'] || 'localhost'}/`,
      sub: process.env['CLIENT_ID'] || 'clientId',
      aud: process.env['CROSS_APP_CLIENT_ID'] || 'crossAppClientId',
      amr: ['internal'],
    };
    return this.jwtService.sign(payload);
  }
}
