import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { PostContentType } from '@org/typings';
import { IPostContent } from '.';

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
export class MultipleChoiceQuestion implements IPostContent {
  type: PostContentType.MULTIPLE_CHOICE;

  @Field({ description: 'The question being asked' })
  question: string;

  @Field((type) => [String], { description: 'The options for the question' })
  options: string[];

  @Field((type) => [Number], { description: 'The vote totals for each option' })
  voteTotals: number[];
}

@InputType()
export class MultipleChoiceQuestionInput extends PickType(
  MultipleChoiceQuestion,
  ['question', 'options', 'type'] as const,
  InputType,
) {}
