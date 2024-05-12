import { Field, InterfaceType, createUnionType } from '@nestjs/graphql';
import { PostContentType } from 'libs/typings/src/posts';
import { User } from '../../../users/models/user.stub';
import { MultipleChoiceResponse } from '../contents/multiple-choice.model';
import { Post } from '../post.model';

@InterfaceType({
  description: 'A response to a post',
})
export abstract class IPostResponse {
  @Field({ description: 'The ID of the response' })
  id: string;

  @Field((type) => User, { description: 'The author of the response' })
  author: User;

  @Field((type) => Post, {
    description: 'The post that the response relates to',
  })
  post: Post;

  @Field((type) => PostContentType, { description: 'The type of content' })
  type: PostContentType;

  @Field({ description: 'The content of the response' })
  content?: string;

  @Field({ description: 'The date and time the response was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the response was last updated' })
  updatedAt: Date;
}

export const PostResponse = createUnionType({
  name: 'PostResponse',
  types: () => [MultipleChoiceResponse] as const,
});
