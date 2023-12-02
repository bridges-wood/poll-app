'use client';
import { useCreateUserMutation, useGetUserNameLazyQuery } from '@org/graphql';
import { auth, provider } from '@poll-app/lib/database/firebase';
import { AuthError, signInWithPopup } from 'firebase/auth';
import _ from 'lodash';
import { useTheme } from 'next-themes';
import Image, { ImageProps } from 'next/image';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

// See https://developers.google.com/identity/branding-guidelines

const DEFAULT_SHAPE = 'rd';
const DEFAULT_VARIANT = 'ctn';

export interface GoogleButtonProps
  extends Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> {
  shape?: 'sq' | 'rd';
  variant?: 'ctn' | 'SI' | 'SU' | 'na';
}

const GoogleButton: FC<GoogleButtonProps> = (props) => {
  const [getUser, { data, error, loading }] = useGetUserNameLazyQuery();
  const [createUser] = useCreateUserMutation();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  if (!_.isNil(resolvedTheme)) {
    const derivedProps = deriveProps(props, resolvedTheme);
    return (
      <Image
        alt=""
        {..._.merge(derivedProps, props)}
        className={`${_.defaultTo(
          props.className,
          ''
        )} cursor-pointer hover:opacity-80`}
        onClick={async (event) => {
          event.preventDefault();
          try {
            const userCredential = await signInWithPopup(auth, provider);

            // Check if the user exists in the database
            const { data: user } = await getUser({
              variables: { id: userCredential.user.uid },
            });

            if (_.isNil(user)) {
              // Check that the user credential has a display name and email
              if (
                _.isNil(userCredential.user.displayName) ||
                _.isNil(userCredential.user.email)
              ) {
                throw new Error('User does not have a display name or email');
              }

              // Create the user
              await createUser({
                variables: {
                  id: userCredential.user.uid,
                  args: {
                    displayName: userCredential.user.displayName,
                    email: userCredential.user.email,
                    photoURL: userCredential.user.photoURL,
                  },
                },
              });
            }

            router.push('/home');
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
        }}
      />
    );
  }
};

/**
 * Derives the src, width, and height props for the button based on Google's branding guidelines
 * @param props The props passed to the GoogleButton component
 * @param theme The resolved theme from next-themes
 * @returns An object containing the src, width, and height props for the inner Image component
 */
const deriveProps = (
  props: GoogleButtonProps,
  theme: string
): Pick<ImageProps, 'src' | 'width' | 'height'> => {
  const { shape = DEFAULT_SHAPE, variant = DEFAULT_VARIANT } = props;
  const src = `/google/${theme}/web_${theme}_${shape}_${variant}.svg`;

  switch (variant) {
    case 'ctn':
      return {
        src,
        width: 197,
        height: 40,
      };
    case 'SI':
      return {
        src,
        width: 183,
        height: 40,
      };
    case 'SU':
      return {
        src,
        width: 188,
        height: 40,
      };
    case 'na':
      return {
        src,
        width: 40,
        height: 40,
      };
    default:
      throw new Error(`Invalid variant: ${variant}`);
  }
};

export default GoogleButton;
