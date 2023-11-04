import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: Buffer.from(process.env.PRIVATE_KEY ?? '', 'base64')
        .toString('utf8')
        .replaceAll(/\\n/g, '\n'),
      clientEmail: process.env.CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export { admin };
