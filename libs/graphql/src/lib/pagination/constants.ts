import { PaginationArgs } from './models/pagination.args';
import { IConnectionType } from './types';

export const EMPTY_PAGE: IConnectionType<never> = {
  edges: [],
  totalCount: 0,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    count: 0,
  },
};

export const DEFAULT_PAGINATION_ARGS: PaginationArgs = {
  first: 10,
};

export const DEFAULT_CHUNK_SIZE = 30;
