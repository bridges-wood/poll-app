import {
  Directive,
  Field,
  InputType,
  InterfaceType,
  createUnionType,
  registerEnumType,
} from '@nestjs/graphql';
import { PostContentType } from '@org/typings';
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionInput,
} from './multiple-choice.model';

registerEnumType(PostContentType, {
  name: 'PostContentType',
  description: 'The type of content for a post',
  valuesMap: {
    MULTIPLE_CHOICE: {
      description: 'A multiple choice question',
    },
  },
}); 

@InterfaceType()
export abstract class IPostContent {
  @Field((type) => PostContentType, { description: 'The type of content' })
  type: PostContentType;
}

export const PostContent = createUnionType({
  name: 'PostContent',
  types: () => [MultipleChoiceQuestion] as const,
  resolveType: (value) => {
    if (value.type === PostContentType.MULTIPLE_CHOICE) {
      return MultipleChoiceQuestion;
    }
    return null;
  },
});

@Directive('@oneOf')
@InputType()
export class PostContentInput {
  @Field((type) => MultipleChoiceQuestionInput, { nullable: true })
  multipleChoiceQuestion?: MultipleChoiceQuestionInput;
}
