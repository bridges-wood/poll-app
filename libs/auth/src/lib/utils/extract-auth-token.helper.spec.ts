import { extractAuthTokenFromHeader } from './extract-auth-token.helper';
import { NotFoundError } from '@org/errors';
import { FastifyRequest as Request } from 'fastify';

describe('extractAuthTokenFromHeader', () => {
  it('should extract the token when authorization header is valid', () => {
    const req = {
      headers: {
        authorization: 'Bearer validtoken123'
      }
    } as Request;

    const token = extractAuthTokenFromHeader(req);
    expect(token).toBe('validtoken123');
  });

  it('should throw NotFoundError when authorization header is missing', () => {
    const req = {
      headers: {}
    } as Request;

    expect(() => extractAuthTokenFromHeader(req)).toThrow(NotFoundError);
    expect(() => extractAuthTokenFromHeader(req)).toThrow('Authorization token not found');
  });

  it('should throw NotFoundError when authorization header is invalid', () => {
    const req = {
      headers: {
        authorization: 'InvalidToken'
      }
    } as Request;

    expect(() => extractAuthTokenFromHeader(req)).toThrow(NotFoundError);
    expect(() => extractAuthTokenFromHeader(req)).toThrow('Authorization token not found');
  });

  it('should throw NotFoundError when authorization header type is not Bearer', () => {
    const req = {
      headers: {
        authorization: 'Basic validtoken123'
      }
    } as Request;

    expect(() => extractAuthTokenFromHeader(req)).toThrow(NotFoundError);
    expect(() => extractAuthTokenFromHeader(req)).toThrow('Authorization token not found');
  });

  it('should throw NotFoundError when token is missing in authorization header', () => {
    const req = {
      headers: {
        authorization: 'Bearer '
      }
    } as Request;

    expect(() => extractAuthTokenFromHeader(req)).toThrow(NotFoundError);
    expect(() => extractAuthTokenFromHeader(req)).toThrow('Authorization token not found');
  });
});