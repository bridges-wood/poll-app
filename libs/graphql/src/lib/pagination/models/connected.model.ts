import { Type } from '@nestjs/common';
import { Field, Int, ObjectType, Union } from '@nestjs/graphql';
import type { IConnectionType, IEdgeType, Node } from '../types';
import { PageInfo } from './page-info.model';

export function Connected<T extends Node>(
  classRef: Type<T> | Union<[T]>,
): Type<IConnectionType<T>> {
  const edgeName =
    typeof classRef === 'object' && (classRef as Union<[T]>).name
      ? (classRef as Union<[T]>).name
      : (classRef as Type<T>).name;

  @ObjectType(`${edgeName}Edge`)
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
      defaultValue: [],
      description: 'Edges connected to this page',
    })
    edges: EdgeType[] = [];

    @Field((type) => Int, { description: 'Total count of items in existence' })
    totalCount!: number;

    @Field((type) => PageInfo, { description: 'Information about this page' })
    pageInfo!: PageInfo;
  }

  return ConnectionType as Type<IConnectionType<T>>;
}
