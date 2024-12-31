import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IPageInfo } from '../types';

@ObjectType()
export class PageInfo implements IPageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPreviousPage!: boolean;

  @Field((type) => String, {
    nullable: true,
    description: 'The cursor to the first item one the page',
  })
  startCursor?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'The cursor to the last item on the page',
  })
  endCursor?: string;

  @Field((type) => Int, {
    description: 'The total number of items in the connection',
  })
  count!: number;
}
