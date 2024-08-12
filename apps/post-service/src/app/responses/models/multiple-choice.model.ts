import {
  Directive,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { PostContentType } from '@org/typings';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.stub';
import { Response } from './response.model';

@ObjectType({
  implements: () => [Response],
  description: 'A response to a multiple choice question',
})
@Directive('@key(selectionSet: "{ id }")')
export class MultipleChoiceResponse implements Response {
  id: string;
  author: User;
  post: Post;
  content?: string;
  createdAt: Date;
  updatedAt: Date;

  @Field((type) => PostContentType, { description: 'The type of content' })
  type: PostContentType.MULTIPLE_CHOICE;

  @Field((type) => Number, { description: 'The index of the option selected' })
  selectedOption: number;
}

@InputType()
export class MultipleChoiceResponseInput extends PickType(
  MultipleChoiceResponse,
  ['selectedOption', 'type', 'content'] as const,
  InputType,
) {
  @Field((type) => String, {
    description: 'The content of the response',
    nullable: true,
  })
  content?: string;
}
