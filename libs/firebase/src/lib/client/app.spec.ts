import { getOrInitializeFirebaseApp } from './app';
import { getApps, initializeApp } from 'firebase/app';

jest.mock('firebase/app', () => ({
  getApps: jest.fn(),
  initializeApp: jest.fn(),
}));

describe('getOrInitializeFirebaseApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the Firebase app if no apps are initialized', () => {
    (getApps as jest.Mock).mockReturnValue([]);

    getOrInitializeFirebaseApp();

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: process.env['FIREBASE_API_KEY'],
      authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
      projectId: process.env['FIREBASE_PROJECT_ID'],
      storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
      messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
      appId: process.env['FIREBASE_APP_ID'],
    });
    expect(getApps).toHaveBeenCalled();
  });

  it('should return the existing Firebase app if already initialized', () => {
    const mockApp = {};
    (getApps as jest.Mock).mockReturnValue([mockApp]);

    const app = getOrInitializeFirebaseApp();

    expect(initializeApp).not.toHaveBeenCalled();
    expect(app).toBe(mockApp);
    expect(getApps).toHaveBeenCalled();
  });
});