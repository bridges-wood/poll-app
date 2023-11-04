import { auth, provider } from '@poll-app/lib/database/firebase';
import { AuthError, signInWithPopup } from 'firebase/auth';
import { Router } from 'next/router';

export const signInWithGoogle = async (router: Router) => {
  try {
    const res = await signInWithPopup(auth, provider);

    // Check if user exists in database
    const user = await getUser(res.user.uid);
    if (!user) {
      // If not create user in database
      await createUser(res.user);
    }

    // Redirect to home page
    router.push('/');
  } catch (error) {
    const err = error as AuthError;
    switch (err.code) {
      case 'auth/popup-closed-by-user':
        return;
      default:
        console.error(err);
        return;
    }
  }
};
