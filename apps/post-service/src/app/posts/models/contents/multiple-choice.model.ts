import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { PostContentType } from '@org/typings';
import { IPostContent } from '.';
import { IPostResponse } from '../response';

export interface MultipleChoiceQuestionDBModel extends IPostContent {
  type: PostContentType.MULTIPLE_CHOICE;
  question: string;
  options: string[];
  voteTotals: { [key: number]: number };
}

@ObjectType({
  implements: () => [IPostContent],
  description: 'A multiple choice question',
})
export class MultipleChoiceQuestion {
  type: PostContentType.MULTIPLE_CHOICE;

  @Field({ description: 'The question being asked' })
  question: string;

  @Field((type) => [String], { description: 'The options for the question' })
  options: string[];

  @Field((type) => [Number], { description: 'The vote totals for each option' })
  voteTotals: number[];

  @Field((type) => [MultipleChoiceResponse], {
    description: 'All responses to the question',
  })
  responses: MultipleChoiceResponse[];
}

@InputType()
export class MultipleChoiceQuestionInput extends PickType(
  MultipleChoiceQuestion,
  ['question', 'options', 'type'] as const,
  InputType,
) {}

@ObjectType({
  implements: () => [IPostResponse],
})
export class MultipleChoiceResponse extends IPostResponse {
  type: PostContentType.MULTIPLE_CHOICE;

  @Field((type) => Number, { description: 'The index of the option selected' })
  selectedOption: number;
}
