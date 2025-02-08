import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens } from '@org/firebase';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { DecodedIdToken, User } from '@org/typings';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { collection, getDoc } from 'firebase/firestore';
import { UserModelMapper } from '../users/models/user.model-mapper';
import { AuthService } from './auth.service';
import { SupportedOAuthProvider } from './supported-oauth-providers';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    (collection as jest.Mock).mockReturnValue({
      withConverter: jest.fn().mockReturnValue({
        doc: jest.fn(),
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: FirebaseTokens.AUTH,
          useValue: {},
        },
        {
          provide: FirebaseTokens.DATABASE,
          useValue: {},
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: UserModelMapper,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInWithEmailAndPassword', () => {
    it('should sign in with email and password', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const uid = 'user-id';
      const token = 'jwt-token';

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { uid },
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ id: uid }),
      });

      jest.spyOn(service, 'generateUserToken').mockResolvedValue(token);
      const result = await service.signInWithEmailAndPassword(email, password);

      expect(result).toBe(token);
    });
  });

  describe('signInWithOAuthToken', () => {
    it('should sign in with OAuth token', async () => {
      const token = 'oauth-token';
      const provider: SupportedOAuthProvider = SupportedOAuthProvider.GOOGLE;
      const uid = 'user-id';
      const jwtToken = 'jwt-token';

      (GoogleAuthProvider.credential as jest.Mock).mockReturnValue({});
      (signInWithCredential as jest.Mock).mockResolvedValue({
        user: { uid },
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ id: uid }),
      });

      jest.spyOn(service, 'generateUserToken').mockResolvedValue(jwtToken);

      const result = await service.signInWithOAuthToken(token, provider);

      expect(result).toBe(jwtToken);
    });

    it('should throw error if OAuth provider is not supported', async () => {
      const token = 'oauth-token';
      const provider: SupportedOAuthProvider =
        'unsupported' as SupportedOAuthProvider;

      await expect(
        service.signInWithOAuthToken(token, provider),
      ).rejects.toThrow(Error);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token', async () => {
      const token = 'old-token';
      const newToken = 'new-token';
      const decodedToken = {
        sub: 'user-id',
        roles: [],
        amr: ['pwd'],
      } as DecodedIdToken;

      jest.spyOn(service, 'validateToken').mockResolvedValue(decodedToken);
      jest.spyOn(service, 'generateUserToken').mockResolvedValue(newToken);
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ id: 'user-id', roles: ['new-role'] }),
      });

      const result = await service.refreshToken(token);

      expect(result).toBe(newToken);
      expect(service.validateToken).toHaveBeenCalledWith(token);
      expect(service.generateUserToken).toHaveBeenCalledWith(
        { id: 'user-id', roles: ['new-role'] },
        decodedToken.amr,
      );
    });
  });

  describe('validateToken', () => {
    it('should validate token', async () => {
      const token = 'jwt-token';
      const decodedToken = { sub: 'user-id', roles: [] };
      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);

      const result = await service.validateToken(token);

      expect(result).toBe(decodedToken);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('generateUserToken', () => {
    it('should generate user token', async () => {
      const user = { id: 'user-id', roles: [] } as User;
      const amr = ['pwd'];
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.generateUserToken(user, amr);

      expect(result).toBeTruthy();
      expect(jwtService.sign).toHaveBeenCalledWith({
        iss: 'poll-app:auth',
        aud: 'poll-app:api',
        sub: user.id,
        roles: user.roles,
        amr,
      });
    });

    it('should support custom issuer and audience', async () => {
      const user = { id: 'user-id', roles: [] } as User;
      const amr = ['pwd'];
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.generateUserToken(
        user,
        amr,
        'custom',
        'api',
      );

      expect(result).toBeTruthy();
      expect(jwtService.sign).toHaveBeenCalledWith({
        iss: 'custom',
        aud: 'api',
        sub: user.id,
        roles: user.roles,
        amr,
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const id = 'user-id';
      const user = { id, roles: [] } as User;

      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(user),
      });

      const result = await service['getUserById'](id);

      expect(result).toBe(user);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const id = 'user-id';

      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(false),
      });

      await expect(service['getUserById'](id)).rejects.toThrow(NotFoundError);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
