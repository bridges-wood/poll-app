import { FirebaseOptions, initializeApp } from 'firebase/app';
import 'firebase/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7O50KA7DQbPl4KaNwbQfCEMGWpoIirZ0",
  authDomain: "poll-app-abd55.firebaseapp.com",
  projectId: "poll-app-abd55",
  storageBucket: "poll-app-abd55.appspot.com",
  messagingSenderId: "762344533515",
  appId: "1:762344533515:web:56fca1a136378da2ce210e"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const database = getFirestore();
