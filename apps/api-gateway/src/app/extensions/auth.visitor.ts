import { ExecutionRequest } from '@graphql-tools/utils';
import { Injectable } from '@nestjs/common';
import { TrustedRequestExtensions } from '@org/typings';
import { ExtensionVisitor } from './extension.visitor';

@Injectable()
export class AuthVisitor implements ExtensionVisitor {
  visit(
    extensions: ExecutionRequest['extensions'],
    { context }: Omit<ExecutionRequest, 'extensions'>,
  ): ExecutionRequest['extensions'] {
    const jwt = context?.jwt;

    if (jwt) {
      // Mark the request as trusted and add the user data
      return {
        ...extensions,
        trusted: true,
        sub: jwt.payload.sub,
        roles: jwt.payload.roles,
      } as TrustedRequestExtensions;
    } else {
      return extensions;
    }
  }
}
