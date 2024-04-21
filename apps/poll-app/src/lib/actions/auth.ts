'use server';

import {
  OAuthSignInDocument,
  OAuthSignInMutation,
  OAuthSignInMutationVariables,
} from '@org/graphql';
import { cookies } from 'next/headers';
import getClient from '../api/registeredClient';
import { getTokenExpirationDate } from './utils';

export async function signInWithOAuthToken(
  token: string,
  provider: string = 'google',
): Promise<void> {
  const { data } = await getClient().mutation<
    OAuthSignInMutation,
    OAuthSignInMutationVariables
  >(OAuthSignInDocument, { token, provider });

  const resultToken = data?.signInWithOAuthToken.token;
  if (!resultToken) {
    throw new Error('Failed to sign in');
  }

  const expires = getTokenExpirationDate(resultToken);
  cookies().set('token', resultToken, {
    expires,
  });
}
