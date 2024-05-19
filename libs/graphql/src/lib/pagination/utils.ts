import {
  IBackwardPagination,
  IEdgeType,
  IForwardPagination,
  Node,
  PaginationArgs,
} from '.';

/**
 * Convert a node to an edge
 * @see https://relay.dev/docs/guides/graphql-server-specification/#schema
 */
export const nodeToEdge = <T extends Node>(node: T): IEdgeType<T> => ({
  cursor: btoa(node.id),
  node,
});

/**
 * Convert a cursor to a node id
 * @see https://relay.dev/graphql/connections.htm#sec-Cursor
 */
export const parseCursor = (cursor: string) => atob(cursor);

export const isForwardPagination = (
  paginationArgs: PaginationArgs,
): paginationArgs is IForwardPagination => {
  return paginationArgs.first !== undefined;
};

export const isBackwardPagination = (
  paginationArgs: PaginationArgs,
): paginationArgs is IBackwardPagination => {
  return paginationArgs.last !== undefined;
};

/**
 * Return the edges to return based on the pagination arguments
 * @see https://relay.dev/graphql/connections.htm#EdgesToReturn()
 */
export const edgesToReturn = <T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) => {
  const edges = applyCursorsToEdges(allEdges, paginationArgs);
  if (isForwardPagination(paginationArgs))
    return edges.slice(0, paginationArgs.first);
  if (isBackwardPagination(paginationArgs))
    return edges.slice(-paginationArgs.last);
  return edges;
};

/**
 * Check if there are more pages before the current page
 * @see https://relay.dev/graphql/connections.htm#HasPreviousPage()
 */
export const hasPreviousPage = <T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) => {
  if (isBackwardPagination(paginationArgs)) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > paginationArgs.last;
  }

  if (isForwardPagination(paginationArgs)) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > 0;
  }

  return false;
};

/**
 * Check if there are more pages after the current page
 * @see https://relay.dev/graphql/connections.htm#HasNextPage()
 */
export const hasNextPage = <T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) => {
  if (isForwardPagination(paginationArgs)) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > paginationArgs.first;
  }

  if (isBackwardPagination(paginationArgs)) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > 0;
  }

  return false;
};

/**
 *
 * @param allEdges
 * @param paginationArgs
 * @see https://relay.dev/graphql/connections.htm#ApplyCursorsToEdges()
 */
export const applyCursorsToEdges = <T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) => {
  const edges = allEdges;
  if (isForwardPagination(paginationArgs)) {
    const afterEdge = edges.findIndex(
      (edge) => edge.cursor === paginationArgs.after,
    );
    if (afterEdge !== -1) return edges.slice(afterEdge + 1);
  }

  if (isBackwardPagination(paginationArgs)) {
    const beforeEdge = edges.findIndex(
      (edge) => edge.cursor === paginationArgs.before,
    );
    if (beforeEdge !== -1) return edges.slice(0, beforeEdge);
  }

  return edges;
};
