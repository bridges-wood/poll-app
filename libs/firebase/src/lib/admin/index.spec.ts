import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '.';

jest.mock('firebase-admin');
jest.spyOn(global.console, 'warn');

describe('Firebase Admin Initialization', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.env = { ...OLD_ENV }; // Make a copy of the old env
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should warn if FIREBASE_ADMIN_PRIVATE_KEY is not set', () => {
    jest.spyOn(global.console, 'warn');

    process.env['FIREBASE_ADMIN_PRIVATE_KEY'] = '';
    initializeFirebaseAdmin();

    expect(console.warn).toHaveBeenCalledWith(
      'FIREBASE_ADMIN_PRIVATE_KEY not found - unable to use Firebase Admin SDK.',
    );
  });

  it('should initialize Firebase Admin SDK if FIREBASE_ADMIN_PRIVATE_KEY is set', () => {
    process.env['FIREBASE_ADMIN_PRIVATE_KEY'] = 'private_key';
    process.env['FIREBASE_PROJECT_ID'] = 'project_id';
    process.env['FIREBASE_CLIENT_EMAIL'] = 'client_email';
    process.env['FIREBASE_DATABASE_URL'] = 'database_url';

    initializeFirebaseAdmin();

    expect(admin.credential.cert).toHaveBeenCalled();
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should not initialize Firebase Admin SDK if already initialized', () => {
    (admin.apps as unknown) = ['app'];

    initializeFirebaseAdmin();

    expect(admin.initializeApp).not.toHaveBeenCalled();
  });
});
