import { Args, Directive, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.stub';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User)
  @Directive('@merge(keyField: "id")')
  async _userById(
    @Args('id', { description: 'The id of the user to get' })
    id: string,
  ): Promise<User> {
    return this.usersService.userById(id);
  }
}
