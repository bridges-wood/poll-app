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
