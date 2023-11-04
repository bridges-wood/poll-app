import { FirebaseOptions, initializeApp } from "firebase/app";
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const app = initializeApp(firebaseConfig);