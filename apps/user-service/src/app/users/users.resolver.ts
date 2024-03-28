import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AuthGuard } from '@org/auth';
import { CreateUserArgs } from './models/create-user.args';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Query((returns) => User)
  async me(@Context() context): Promise<User> {
    console.log(context);
    return context.user;
  }

  @Query((returns) => User, { description: 'Get a user by id' })
  async user(
    @Args('id', { description: 'The id of the user to get' }) id: string,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Query((returns) => [User], { description: 'Get all users' })
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Subscription((returns) => User, {
    description: 'Subscribe to all changes on a user by id',
  })
  userUpdated(
    @Args('id', {
      description: 'The id of the user to subscribe to changes on',
    })
    id: string,
  ) {
    return this.usersService.streamUser(id);
  }

  @Mutation((returns) => User, { description: 'Create a new user' })
  async createUser(
    @Args('id', { description: 'The id of the new user to create' }) id: string,
    @Args('args') args: CreateUserArgs,
  ): Promise<User> {
    return this.usersService.createOne(id, args);
  }

  @Mutation((returns) => Boolean!, {
    nullable: true,
    description: 'Update a user by id',
  })
  async updateUser(
    @Args('id', { description: 'The id of the user to update' }) id: string,
    @Args('args') args: CreateUserArgs,
  ): Promise<void> {
    return this.usersService.updateOne(id, args);
  }
}
