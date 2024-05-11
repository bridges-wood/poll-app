import { Args, Directive, Query, Resolver } from '@nestjs/graphql';
import { Post } from './models/post.stub';
import { PostsService } from './posts.service';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query((returns) => Post, { description: 'Get the author of a post by id' })
  @Directive('@merge(keyField: "id")')
  async _postById(@Args('id') id: string): Promise<Post> {
    return await this.postsService.postById(id);
  }
}
