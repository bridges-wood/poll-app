import { Type } from '@nestjs/common';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Min } from 'class-validator';

export interface Node {
  id: string;
}

export interface IEdgeType<T extends Node> {
  cursor: string;
  node: T;
}

export interface IConnectionType<T extends Node> {
  edges: IEdgeType<T>[];
  totalCount: number;
  pageInfo: IPageInfo;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  count: number;
}

export interface IForwardPagination {
  first: number;
  after?: string;
}

export interface IBackwardPagination {
  last: number;
  before?: string;
}

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
  startCursor: string;

  @Field((type) => String, {
    nullable: true,
    description: 'The cursor to the last item on the page',
  })
  endCursor: string;

  @Field((type) => Int, {
    description: 'The total number of items in the connection',
  })
  count: number;
}

export function Connected<T extends Node>(
  classRef: Type<T>,
): Type<IConnectionType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType implements IEdgeType<T> {
    @Field((type) => String, {
      description: 'A cursor for use in pagination',
    })
    cursor!: string;

    @Field((type) => classRef, {
      description: 'The item at the end of the edge',
    })
    node!: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class ConnectionType implements IConnectionType<T> {
    @Field((type) => [EdgeType], {
      nullable: true,
      description: 'Edges connected to this page',
    })
    edges: EdgeType[];

    @Field((type) => Int, { description: 'Total count of items in existence' })
    totalCount!: number;

    @Field((type) => PageInfo, { description: 'Information about this page' })
    pageInfo!: PageInfo;
  }

  return ConnectionType as Type<IConnectionType<T>>;
}

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
}

export * from './constants';
export * from './pagination.service';
export * from './utils';
