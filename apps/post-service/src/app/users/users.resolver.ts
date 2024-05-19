import {
  Args,
  Directive,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PaginationArgs } from '@org/graphql/pagination';
import { PostConnection } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { InternalUser, User } from './models/user.stub';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Query((returns) => User, { description: 'Get a user by id' })
  @Directive('@merge(keyField: "id")')
  async _userById(
    @Args('id', { description: 'The id of the user to get' })
    id: string,
  ): Promise<InternalUser> {
    return this.usersService.userById(id);
  }

  @ResolveField((returns) => PostConnection, {
    description: 'Get all posts by a user',
  })
  async posts(
    @Args() args: PaginationArgs,
    @Parent() user: User,
  ): Promise<PostConnection> {
    const { posts } = await this.usersService.userById(user.id);
    return this.postsService.findByIds(posts, args);
  }
}
