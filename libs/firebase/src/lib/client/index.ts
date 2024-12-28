import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getOrInitializeFirebaseApp } from './app';

export const firebaseApp = getOrInitializeFirebaseApp();
export const auth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();
export const database = getFirestore(firebaseApp);
