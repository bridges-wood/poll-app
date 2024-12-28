import * as admin from 'firebase-admin';
import { isEmpty } from 'lodash';

initializeFirebaseAdmin();

export function initializeFirebaseAdmin() {
  if (alreadyInitialised()) {
    if (!process.env['FIREBASE_ADMIN_PRIVATE_KEY']) {
      console.warn(
        'FIREBASE_ADMIN_PRIVATE_KEY not found - unable to use Firebase Admin SDK.',
      );
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          privateKey: process.env['FIREBASE_ADMIN_PRIVATE_KEY'].replaceAll(
            /\\n/g,
            '\n',
          ),
          projectId: process.env['FIREBASE_PROJECT_ID'],
          clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
        }),
        databaseURL: process.env['FIREBASE_DATABASE_URL'],
      });
    }
  }
}

function alreadyInitialised() {
  return isEmpty(admin.apps);
}

export { admin };
