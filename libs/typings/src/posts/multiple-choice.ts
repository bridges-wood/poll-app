import { PostContent, PostContentType, PostResponse } from '.';

export interface MultipleChoiceQuestion extends PostContent {
  type: PostContentType.MULTIPLE_CHOICE;
  question: string;
  options: string[];
  /**
   * Map of option index to vote count
   */
  voteTotals: Map<number, number>;
  responses: MultipleChoiceResponse[];
}

export interface MultipleChoiceResponse extends PostResponse {
  type: PostContentType.MULTIPLE_CHOICE;
  selectedOption: number;
}
