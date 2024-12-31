import { IBackwardPagination, IEdgeType, IForwardPagination, Node } from '.';
import { PaginationArgs } from './models/pagination.args';

/**
 * Convert a node to an edge
 * @see https://relay.dev/docs/guides/graphql-server-specification/#schema
 */
export function nodeToEdge<T extends Node>(node: T): IEdgeType<T> {
  return {
    cursor: btoa(node.id),
    node,
  };
}

/**
 * Convert a cursor to a node id
 * @see https://relay.dev/graphql/connections.htm#sec-Cursor
 */
export function parseCursor(cursor: string) {
  return atob(cursor);
}

export function isForwardPagination(
  paginationArgs: PaginationArgs,
): paginationArgs is IForwardPagination {
  return paginationArgs.first !== undefined;
}

export function isBackwardPagination(
  paginationArgs: PaginationArgs,
): paginationArgs is IBackwardPagination {
  return paginationArgs.last !== undefined;
}

/**
 * Return the edges to return based on the pagination arguments
 * @see https://relay.dev/graphql/connections.htm#EdgesToReturn()
 */
export function edgesToReturn<T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) {
  const edges = applyCursorsToEdges(allEdges, paginationArgs);
  if (isForwardPagination(paginationArgs))
    return edges.slice(0, paginationArgs.first);
  if (isBackwardPagination(paginationArgs))
    return edges.slice(-paginationArgs.last);
  return edges;
}

/**
 * Check if there are more pages before the current page
 * @see https://relay.dev/graphql/connections.htm#HasPreviousPage()
 */
export function hasPreviousPage<T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) {
  if (paginationArgs.last) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > paginationArgs.last;
  }

  if (paginationArgs.after) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > 0;
  }

  return false;
}

/**
 * Check if there are more pages after the current page
 * @see https://relay.dev/graphql/connections.htm#HasNextPage()
 */
export function hasNextPage<T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) {
  if (paginationArgs.first) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > paginationArgs.first;
  }

  if (paginationArgs.before) {
    const edges = applyCursorsToEdges(allEdges, paginationArgs);
    return edges.length > 0;
  }

  return false;
}

/**
 *
 * @param allEdges
 * @param paginationArgs
 * @see https://relay.dev/graphql/connections.htm#ApplyCursorsToEdges()
 */
export function applyCursorsToEdges<T extends Node>(
  allEdges: IEdgeType<T>[],
  paginationArgs: PaginationArgs,
) {
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
}
