import { NotFoundError } from '@org/errors';
import { USERS_COLLECTION } from '@org/firebase';
import { admin } from '@org/firebase/admin';
import { User } from '@org/typings';
import { FastifyRequest as Request } from 'fastify';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

/**
 * Extracts the authorization token from the request object
 * @param req request object
 * @returns the token extracted from the request if it exists, otherwise throws
 */
export const extractAuthTokenFromHeader = (req: Request): string => {
  const [type, token] = req.headers['authorization']?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    throw new NotFoundError('Authorization token not found');
  }

  return token;
};

/**
 * Extracts an account from an authorization token
 *
 * @param token The authorization token to extract the account from
 * @returns The account associated with the token, if it exists
 */
export const getUserFromToken = async (token: string): Promise<User> => {
  const decodedToken: DecodedIdToken = await admin.auth().verifyIdToken(token);
  const accountSnapshot = await admin
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(decodedToken.uid)
    .get();

  if (!accountSnapshot.exists) {
    throw new NotFoundError('Account not found');
  }

  const account = accountSnapshot.data();

  if (!account) {
    throw new NotFoundError('Account has no data');
  }

  // TODO - Sync the User type with the Firestore schema
  return account as User;
};
