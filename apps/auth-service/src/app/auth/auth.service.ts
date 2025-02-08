import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens, USERS_COLLECTION } from '@org/firebase';
import { BaseLogger } from '@org/log';
import { DecodedIdToken } from '@org/typings';
import {
  Auth,
  GoogleAuthProvider,
  OAuthCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDoc,
  PartialWithFieldValue,
} from 'firebase/firestore';
import { User } from '../users/models/user.model';
import { UserModelMapper } from '../users/models/user.model-mapper';
import { SupportedOAuthProvider } from './supported-oauth-providers';

@Injectable()
export class AuthService {
  private collectionRef: CollectionReference<
    PartialWithFieldValue<User>,
    PartialWithFieldValue<User>
  >;

  constructor(
    private readonly jwtService: JwtService,
    userModelMapper: UserModelMapper,
    @Inject(FirebaseTokens.AUTH) private readonly firebaseAuth: Auth,
    @Inject(FirebaseTokens.DATABASE) database: Firestore,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(AuthService.name);
    this.collectionRef = collection(database, USERS_COLLECTION).withConverter(
      userModelMapper,
    );
  }

  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<string> {
    const cred = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    );
    const user = await this.getUserById(cred.user.uid);

    return this.generateUserToken(user, ['pwd']);
  }

  async signInWithOAuthToken(
    token: string,
    provider: SupportedOAuthProvider,
  ): Promise<string> {
    const authCred = this.exchangeOAuthTokenForCredential(token, provider);
    const userCred = await signInWithCredential(this.firebaseAuth, authCred);
    const user = await this.getUserById(userCred.user.uid);

    return this.generateUserToken(user, [provider]);
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
    // Get the user from the database to ensure it still exists, and to get the latest roles
    const user = await this.getUserById(decoded.sub);

    return this.generateUserToken(
      {
        id: user.id,
        roles: user.roles,
      },
      decoded.amr,
    );
  }

  async validateToken(token: string): Promise<DecodedIdToken> {
    this.logger.debug(`Validating token: ${token}`);
    return this.jwtService.verify(token);
  }

  async generateUserToken(
    user: Pick<User, 'id' | 'roles'>,
    authMethods: string[],
    iss = 'poll-app:auth',
    aud = 'poll-app:api',
  ): Promise<string> {
    const payload: Pick<
      DecodedIdToken,
      'iss' | 'sub' | 'aud' | 'amr' | 'roles'
    > = {
      iss,
      sub: user.id,
      roles: user.roles,
      aud,
      amr: authMethods,
    };
    return this.jwtService.sign(payload);
  }

  private async getUserById(id: string): Promise<User> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`User with id "${id}" not found`);

    return docSnap.data() as User;
  }
}
