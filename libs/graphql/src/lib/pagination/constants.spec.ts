import { EMPTY_PAGE, DEFAULT_PAGINATION_ARGS, DEFAULT_CHUNK_SIZE } from './constants';
import { IConnectionType } from './types';
import { PaginationArgs } from './models/pagination.args';

describe('Constants', () => {
  it('should have an EMPTY_PAGE with correct default values', () => {
    const expectedEmptyPage: IConnectionType<never> = {
      edges: [],
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        count: 0,
      },
    };
    expect(EMPTY_PAGE).toEqual(expectedEmptyPage);
  });

  it('should have DEFAULT_PAGINATION_ARGS with correct default values', () => {
    const expectedPaginationArgs: PaginationArgs = {
      first: 10,
    };
    expect(DEFAULT_PAGINATION_ARGS).toEqual(expectedPaginationArgs);
  });

  it('should have DEFAULT_CHUNK_SIZE with correct default value', () => {
    const expectedChunkSize = 30;
    expect(DEFAULT_CHUNK_SIZE).toBe(expectedChunkSize);
  });
});