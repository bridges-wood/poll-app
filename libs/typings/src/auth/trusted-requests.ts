import type { GraphQLParams } from 'graphql-yoga';
import { User } from '../user';

export type TrustedRequestExtensions = GraphQLParams['extensions'] & {
  trusted: true;
  sub: User['id'];
  roles: User['roles'];
};

export type TrustedParams = GraphQLParams & {
  extensions: TrustedRequestExtensions;
};
