import {
  Directive,
  Field,
  InputType,
  InterfaceType,
  ObjectType,
} from '@nestjs/graphql';
import { Connected, Node } from '@org/graphql/pagination';
import { PostContentType } from '@org/typings';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.stub';
import {
  MultipleChoiceResponse,
  MultipleChoiceResponseInput,
} from './multiple-choice.model';

@InterfaceType({
  description: 'A response to a post',
  resolveType: (value: Response) => {
    switch (value.type) {
      case PostContentType.MULTIPLE_CHOICE:
        return MultipleChoiceResponse;
      default:
        return null;
    }
  },
})
export abstract class Response implements Node {
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

  @Field((type) => String, {
    description: 'The content of the response',
    nullable: true,
  })
  content?: string;

  @Field({ description: 'The date and time the response was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the response was last updated' })
  updatedAt: Date;
}

@ObjectType()
export class ResponseConnection extends Connected(Response) {}

@Directive('@oneOf')
@InputType()
export class ResponseInput {
  @Field((type) => MultipleChoiceResponseInput, { nullable: true })
  multipleChoiceResponse?: MultipleChoiceResponseInput;
}
