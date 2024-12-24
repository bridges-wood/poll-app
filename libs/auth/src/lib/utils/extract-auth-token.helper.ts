import { NotFoundError } from '@org/errors';
import { FastifyRequest as Request } from 'fastify';

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
