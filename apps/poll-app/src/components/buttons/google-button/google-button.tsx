'use client';
import { Button } from '@org/ui-kit/ui/button';
import GoogleIcon from '@poll-app/components/icons/google-icon';
import { signInWithOAuthToken } from '@poll-app/lib/actions/auth';
import { auth } from '@poll-app/lib/firebase';
import { Dispatch } from '@poll-app/lib/store';
import { AuthError, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { isNil } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

// See https://developers.google.com/identity/branding-guidelines

const GoogleButton: FC = () => {
  const [disabled, setDisabled] = useState(false)
  const router = useRouter();
  const dispatch = useDispatch<Dispatch>();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/home';

  return (
    <Button
      className="w-full justify-center py-2 font-light"
      variant="outline"
      disabled={disabled}
      onClick={async (event) => {
        event.preventDefault();
        setDisabled(true);
        try {
          const result = await signInWithPopup(auth, new GoogleAuthProvider());
          const authCredential =
            GoogleAuthProvider.credentialFromResult(result);
          if (isNil(authCredential?.idToken)) {
            throw new Error('Failed to get auth credential');
          }

          const token = await signInWithOAuthToken(authCredential.idToken);
          dispatch.auth.login(token);
          router.push(redirect);
        } catch (error) {
          setDisabled(false);
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
