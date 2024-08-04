'use server';

import {
  OAuthSignInDocument,
  OAuthSignInMutation,
  OAuthSignInMutationVariables,
} from '@org/graphql';
import { cookies } from 'next/headers';
import getClient from '../api/registered-client';
import { getTokenExpirationDate } from './utils';

export async function signInWithOAuthToken(
  token: string,
  provider: string = 'google',
): Promise<string> {
  const { data, error } = await getClient().mutation<
    OAuthSignInMutation,
    OAuthSignInMutationVariables
  >(OAuthSignInDocument, { token, provider });

  const resultToken = data?.signInWithOAuthToken.token;
  if (!resultToken) {
    throw new Error(error?.message);
  }

  setCookie(resultToken);
  return resultToken;
}

const setCookie = (token: string) => {
  const expires = getTokenExpirationDate(token);
  cookies().set('token', token, {
    expires,
  });
};
