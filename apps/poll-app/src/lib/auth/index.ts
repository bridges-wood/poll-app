import {
  RefreshTokenDocument,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
  ValidateTokenDocument,
  ValidateTokenQuery,
  ValidateTokenQueryVariables,
} from '@org/graphql';
import { NextRequest } from 'next/server';
import { client } from '../api/proxy-client';

export const authenticate = async (req: NextRequest): Promise<boolean> => {
  // Extract the token from the request
  const token = req.cookies.get('token')?.value;
  if (!token || token.length === 0) {
    return false;
  }

  // Validate the token
  try {
    const { data } = await client.query<
      ValidateTokenQuery,
      ValidateTokenQueryVariables
    >(ValidateTokenDocument, { token });

    return !!data?.validateToken;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const refreshToken = async (req: NextRequest): Promise<string> => {
  // Extract the token from the request
  const token = req.cookies.get('token')?.value;
  if (!token) {
    throw new Error('No token found in the request');
  }

  // Validate the token

  const { data } = await client.mutation<
    RefreshTokenMutation,
    RefreshTokenMutationVariables
  >(RefreshTokenDocument, { token });

  return data?.refreshToken.token || '';
};
