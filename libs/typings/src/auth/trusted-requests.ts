import type { GraphQLParams } from 'graphql-yoga';
import { User } from '../user';

/**
 * GraphQL request extensions for trusted requests.
 */
export type TrustedRequestExtensions = GraphQLParams['extensions'] & {
  /**
   * Trusted request flag - if true, the request is trusted and the user is authenticated. Can only be set by the gateway.
   */
  trusted: true;
  /**
   * User ID of the authenticated user. Can only be set by the gateway.
   */
  sub: User['id'];
  /**
   * Roles of the authenticated user. Can only be set by the gateway.
   */
  roles: User['roles'];
};

export type TrustedParams = GraphQLParams & {
  extensions: TrustedRequestExtensions;
};
