import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@org/typings';

export const currentUserFactory = (
  _data: unknown,
  context: ExecutionContext,
): User => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
};

/**
 * Defines HTTP route param decorator to extract the current user from the request.
 * @returns {ParameterDecorator} The current user from the request.
 */
export const CurrentUser = createParamDecorator(currentUserFactory);
