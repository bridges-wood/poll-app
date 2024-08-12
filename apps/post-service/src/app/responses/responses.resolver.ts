import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@org/auth';
import { PaginationArgs } from '@org/graphql/pagination';
import { Post } from '../posts/models/post.model';
import { User } from '../users/models/user.stub';
import {
  Response,
  ResponseConnection,
  ResponseInput,
} from './models/response.model';
import { ResponsesService } from './responses.service';

@Resolver((of) => Post)
export class ResponsesResolver {
  constructor(private readonly responsesService: ResponsesService) {}

  @Mutation((returns) => Response, {
    description: 'Create a response to a post',
  })
  async createResponse(
    @Args('postId', { description: 'The id of the post to respond to' })
    postId: string,
    @Args('args') args: ResponseInput,
    @CurrentUser() user: Pick<User, 'id'>,
  ): Promise<Response> {
    return this.responsesService.createResponse(postId, args, user);
  }

  @ResolveField((returns) => ResponseConnection, {
    description: 'All responses to the post',
  })
  async responses(
    @Args() args: PaginationArgs,
    @Parent() parent: Post,
  ): Promise<ResponseConnection> {
    return this.responsesService.findAllByPostId(parent.id, args);
  }
}
