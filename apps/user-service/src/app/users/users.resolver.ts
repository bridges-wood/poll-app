import { UseGuards } from '@nestjs/common';
import {
  Args,
  Directive,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser, Roles, RolesGuard } from '@org/auth';
import { PaginationArgs } from '@org/graphql/pagination';
import { CreateUserArgs } from './models/create-user.args';
import { UpdateUserArgs } from './models/update-user.args';
import { User, UserConnection } from './models/user.model';
import { UsersService } from './users.service';
import { BaseLogger } from '@org/log';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User, {
    description: 'Get the user from the passed authorization header',
  })
  async me(@CurrentUser() user: Pick<User, 'id'>): Promise<User> {
    return this.usersService.findOneById(user.id);
  }

  @Directive('@merge(keyField: "id")')
  @Query((returns) => User, { description: 'Get a user by id' })
  async user(
    @Args('id', { description: 'The id of the user to get' }) id: string,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Query((returns) => UserConnection, { description: 'Get all users' })
  async users(@Args() args: PaginationArgs): Promise<UserConnection> {
    return this.usersService.findAll(args);
  }

  @Subscription((returns) => User, {
    description: 'Subscribe to all changes on a user by id',
    resolve: (payload: User) => payload,
    filter: (payload, variables) => payload.id === variables.id,
  })
  userUpdated(
    @Args('id', {
      description: 'The id of the user to subscribe to changes on',
    })
    id: string,
  ): AsyncIterableIterator<User> {
    return this.usersService.streamUser(id);
  }

  @Mutation((returns) => User, { description: 'Create a new user' })
  async createUser(
    @Args('id', { description: 'The id of the new user to create' }) id: string,
    @Args('args') args: CreateUserArgs,
  ): Promise<User> {
    return this.usersService.createOne(id, args);
  }

  @Mutation((returns) => User, {
    nullable: true,
    description: 'Update a user by id',
  })
  async updateUser(
    @Args('id', { description: 'The id of the user to update' }) id: string,
    @Args('args') args: UpdateUserArgs,
  ): Promise<User> {
    return this.usersService.updateOne(id, args);
  }
}
