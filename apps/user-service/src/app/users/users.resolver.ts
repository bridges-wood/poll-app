import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CreateUserArgs } from './models/create-user.args';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User)
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Query((returns) => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Subscription((returns) => User)
  userUpdated(@Args('id') id: string) {
    return this.usersService.streamUser(id);
  }

  @Mutation((returns) => User)
  async createUser(
    @Args('id') id: string,
    @Args('args') args: CreateUserArgs
  ): Promise<User> {
    return this.usersService.createOne(id, args);
  }

  @Mutation((returns) => Boolean!, { nullable: true })
  async updateUser(
    @Args('id') id: string,
    @Args('args') args: CreateUserArgs
  ): Promise<void> {
    return this.usersService.updateOne(id, args);
  }
}
