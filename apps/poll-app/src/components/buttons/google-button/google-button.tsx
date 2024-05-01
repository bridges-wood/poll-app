'use client';
import { Button } from '@org/ui-kit/ui/button';
import GoogleIcon from '@poll-app/components/icons/google-icon';
import { signInWithOAuthToken } from '@poll-app/lib/actions/auth';
import { auth } from '@poll-app/lib/firebase';
import { AuthError, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { isNil } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';

// See https://developers.google.com/identity/branding-guidelines

const GoogleButton: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/home';

  return (
    <Button
      className="w-full justify-center py-2 font-light"
      variant="outline"
      onClick={async (event) => {
        event.preventDefault();
        router.prefetch(redirect);
        try {
          const result = await signInWithPopup(auth, new GoogleAuthProvider());
          const authCredential =
            GoogleAuthProvider.credentialFromResult(result);
          if (isNil(authCredential?.idToken)) {
            throw new Error('Failed to get auth credential');
          }

          await signInWithOAuthToken(authCredential.idToken);
          router.push(redirect);
        } catch (error) {
          const err = error as AuthError;
          switch (err.code) {
            case 'auth/account-exists-with-different-credential':
              // TODO handle this error
              return;
            case 'auth/cancelled-popup-request':
              return;
            case 'auth/popup-closed-by-user':
              return;
            default:
              console.error(err);
              return;
          }
        }
      }}
    >
      <GoogleIcon className="mr-[4px] h-3 w-3" />
      Google
    </Button>
  );
};

export default GoogleButton;
