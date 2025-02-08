import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { FirebaseCoreModule } from './firebase-core.module';
import { FirebaseTokens } from './tokens';

jest.mock('./client', () => ({
  auth: 'auth',
  database: 'database',
}));

describe('FirebaseCoreModule', () => {
  let module: TestingModule;
  let logger: BaseLogger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
      imports: [FirebaseCoreModule.forRoot()],
    }).compile();

    logger = await module.resolve<TestLogger>(BaseLogger);
  });

  it('should set the logger context', () => {
    const setContextSpy = jest.spyOn(logger, 'setContext');
    new FirebaseCoreModule(logger);
    expect(setContextSpy).toHaveBeenCalledWith(FirebaseCoreModule.name);
  });

  it('should provide the auth provider', () => {
    const authProvider = module.get(FirebaseTokens.AUTH);
    expect(authProvider).toBe('auth');
  });

  it('should provide the database provider', () => {
    const databaseProvider = module.get(FirebaseTokens.DATABASE);
    expect(databaseProvider).toBe('database');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
