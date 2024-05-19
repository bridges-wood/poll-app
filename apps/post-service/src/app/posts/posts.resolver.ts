import {
  Args,
  Field,
  Mutation,
  Parent,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser } from '@org/auth';
import { PaginationArgs } from '@org/graphql/pagination';
import { InternalUser, User } from '../users/models/user.stub';
import { UsersService } from '../users/users.service';
import { CreatePostArgs } from './models/create-post.args';
import { Post, PostConnection } from './models/post.model';
import { UpdatePostArgs } from './models/update-post.args';
import { PostsService } from './posts.service';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly userService: UsersService,
  ) {}

  @Field((type) => User, { description: 'The author of the post' })
  async author(@Parent() post: Post): Promise<InternalUser> {
    return this.userService.userById(post.author.id);
  }

  @Query((returns) => Post, { description: 'Get a post by id' })
  async post(
    @Args('id', { description: 'The id of the post to get' }) id: string,
  ): Promise<Post> {
    return this.postsService.findOneById(id);
  }

  @Query((returns) => PostConnection, { description: 'Get all posts' })
  async posts(@Args() args: PaginationArgs): Promise<PostConnection> {
    return this.postsService.findAll(args);
  }

  @Query((returns) => PostConnection, { description: 'Get all posts by id' })
  async postsByIds(
    @Args('ids', {
      type: () => [String],
      description: 'The ids of the posts to get',
    })
    ids: string[],
    @Args() args: PaginationArgs,
  ): Promise<PostConnection> {
    return this.postsService.findByIds(ids, args);
  }

  @Subscription((returns) => Post, {
    description: 'Subscribe to all changes on a post by id',
  })
  postUpdated(
    @Args('id', {
      description: 'The id of the post to subscribe to changes on',
    })
    id: string,
  ) {
    return this.postsService.streamPost(id);
  }

  @Mutation((returns) => Post, { description: 'Create a new post' })
  async createPost(
    @Args('args') args: CreatePostArgs,
    @CurrentUser() user: Pick<User, 'id'>,
  ): Promise<Post> {
    return this.postsService.createOne(args, user);
  }

  @Mutation((returns) => Post, {
    nullable: true,
    description: 'Update a post by id',
  })
  async updatePost(
    @Args('id', { description: 'The id of the post to update' }) id: string,
    @Args('args') args: UpdatePostArgs,
  ): Promise<Post> {
    return this.postsService.updateOne(id, args);
  }

  // TODO add guard to only allow the author to delete their own posts
  @Mutation((returns) => Boolean, {
    description: 'Delete a post by id',
  })
  async deletePost(
    @Args('id', { description: 'The id of the post to delete' }) id: string,
  ): Promise<boolean> {
    return this.postsService.deleteOne(id);
  }
}
