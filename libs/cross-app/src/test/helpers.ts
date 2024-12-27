import { Operation, OperationResult } from '@urql/core';

export const toResult = jest.fn(
  (operation: Operation): OperationResult => ({
    data: {
      test: true,
    },
    stale: false,
    hasNext: false,
    operation,
  }),
);
