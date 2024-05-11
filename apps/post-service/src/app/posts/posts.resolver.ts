import {
  Args,
  Directive,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser } from '@org/auth';
import { User } from '../users/models/user.stub';
import { CreatePostArgs } from './models/create-post.args';
import { Post } from './models/post.model';
import { UpdatePostArgs } from './models/update-post.args';
import { PostsService } from './posts.service';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query((returns) => Post, { description: 'Get a post by id' })
  async post(
    @Args('id', { description: 'The id of the post to get' }) id: string,
  ): Promise<Post> {
    return this.postsService.findOneById(id);
  }

  @Query((returns) => [Post], { description: 'Get all posts' })
  async posts(): Promise<Post[]> {
    return this.postsService.findAll();
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
