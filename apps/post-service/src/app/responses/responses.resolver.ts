import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { Response } from './models/response.stub';

@Resolver((of) => Response)
export class ResponsesResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField((returns) => Post, {
    description: 'The post that the response relates to',
  })
  async post(@Parent() postResponse: Response): Promise<Post> {
    return this.postsService.findOneById(postResponse.post.id);
  }
}
