import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@org/typings';
import { currentUserFactory } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  let graphqlExecutionContext: GqlExecutionContext;
  let executionContext: ExecutionContext;

  beforeEach(() => {
    graphqlExecutionContext = {
      getContext: jest.fn(),
      getRoot: jest.fn(),
      getArgs: jest.fn(),
      getInfo: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as GqlExecutionContext;
    executionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn().mockReturnValue([]),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('should return the current user from the request', () => {
    const user: User = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      email: 'testuser@example.com',
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
      posts: [],
    };
    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(graphqlExecutionContext);
    jest
      .spyOn(graphqlExecutionContext, 'getContext')
      .mockReturnValue({ req: { user } });

    const result = currentUserFactory(null, executionContext);
    expect(result).toEqual(user);
  });

  it('should return undefined if no user is found in the request', () => {
    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(graphqlExecutionContext);
    jest
      .spyOn(graphqlExecutionContext, 'getContext')
      .mockReturnValue({ req: {} });

    const result = currentUserFactory(null, executionContext);
    expect(result).toBeUndefined();
  });
});
