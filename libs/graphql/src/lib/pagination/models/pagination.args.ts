import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { IBackwardPagination, IForwardPagination } from '../types';

@ArgsType()
export class PaginationArgs
  implements Partial<IForwardPagination>, Partial<IBackwardPagination>
{
  @Field((type) => Int, {
    nullable: true,
    description: 'The number of items to return',
    // defaultValue: 10,
  })
  @Min(1)
  first?: number;

  @Field((type) => String, {
    nullable: true,
    description: 'Cursor after which items will be returned',
  })
  after?: string;

  @Field((type) => Int, {
    nullable: true,
    description: 'The number of items to return',
  })
  @Min(1)
  last?: number;

  @Field((type) => String, {
    nullable: true,
    description: 'Cursor before which items will be returned',
  })
  before?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'The field on the resultant node to order by',
    defaultValue: 'id',
  })
  orderBy?: string;
}
