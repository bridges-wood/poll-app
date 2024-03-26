import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: (process.env['FIREBASE_ADMIN_PRIVATE_KEY'] ?? '').replaceAll(
        /\\n/g,
        '\n',
      ),
      projectId: process.env['FIREBASE_PROJECT_ID'],
      clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
    }),
    databaseURL: process.env['FIREBASE_DATABASE_URL'],
  });
}

export { admin };
