import { User } from '@org/graphql';
import { DecodedIdToken } from '@org/typings';
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

/**
 * Retrieves the ID of the currently logged in user.
 * @returns The ID of the currently logged in user.
 */
export const getLoggedInUserId = async (): Promise<User['id']> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const userId = (jwtDecode(token) as DecodedIdToken).sub;

  return userId;
};
