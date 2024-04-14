'use server';

import {
  OAuthSignInDocument,
  OAuthSignInMutation,
  OAuthSignInMutationVariables,
} from '@org/graphql';
import { cookies } from 'next/headers';
import { registeredClient } from '../api';

export async function signInWithOAuthToken(
  token: string,
  provider: string = 'google',
): Promise<void> {
  const { data } = await registeredClient.mutate<
    OAuthSignInMutation,
    OAuthSignInMutationVariables
  >({
    mutation: OAuthSignInDocument,
    variables: { token, provider },
  });

  const resultToken = data?.signInWithOAuthToken.token;
  if (!resultToken) {
    throw new Error('Failed to sign in');
  }

  cookies().set('token', resultToken);
}
