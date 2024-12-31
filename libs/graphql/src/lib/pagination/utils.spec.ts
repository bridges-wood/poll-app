import { IEdgeType, Node } from '.';
import { PaginationArgs } from './models/pagination.args';
import {
  applyCursorsToEdges,
  edgesToReturn,
  hasNextPage,
  hasPreviousPage,
  isBackwardPagination,
  isForwardPagination,
  nodeToEdge,
  parseCursor,
} from './utils';

describe('Pagination Utils', () => {
  const node: Node = { id: '1' };
  const edge: IEdgeType<Node> = { cursor: btoa(node.id), node };

  describe('nodeToEdge', () => {
    it('should convert a node to an edge', () => {
      expect(nodeToEdge(node)).toEqual(edge);
    });
  });

  describe('parseCursor', () => {
    it('should convert a cursor to a node id', () => {
      expect(parseCursor(edge.cursor)).toEqual(node.id);
    });
  });

  describe('isForwardPagination', () => {
    it('should return true for forward pagination', () => {
      const paginationArgs: PaginationArgs = { first: 10 };
      expect(isForwardPagination(paginationArgs)).toBe(true);
    });

    it('should return false for non-forward pagination', () => {
      const paginationArgs: PaginationArgs = { last: 10 };
      expect(isForwardPagination(paginationArgs)).toBe(false);
    });
  });

  describe('isBackwardPagination', () => {
    it('should return true for backward pagination', () => {
      const paginationArgs: PaginationArgs = { last: 10 };
      expect(isBackwardPagination(paginationArgs)).toBe(true);
    });

    it('should return false for non-backward pagination', () => {
      const paginationArgs: PaginationArgs = { first: 10 };
      expect(isBackwardPagination(paginationArgs)).toBe(false);
    });
  });

  describe('edgesToReturn', () => {
    const allEdges: IEdgeType<Node>[] = [
      edge,
      { cursor: btoa('2'), node: { id: '2' } },
    ];

    it('should return edges for forward pagination', () => {
      const paginationArgs: PaginationArgs = { first: 1 };
      expect(edgesToReturn(allEdges, paginationArgs)).toEqual([edge]);
    });

    it('should return edges for backward pagination', () => {
      const paginationArgs: PaginationArgs = { last: 1 };
      expect(edgesToReturn(allEdges, paginationArgs)).toEqual([
        { cursor: btoa('2'), node: { id: '2' } },
      ]);
    });

    it('should return all edges if no pagination arguments are provided', () => {
      const paginationArgs: PaginationArgs = {};
      expect(edgesToReturn(allEdges, paginationArgs)).toEqual(allEdges);
    });
  });

  describe('hasPreviousPage', () => {
    const allEdges: IEdgeType<Node>[] = [
      edge,
      { cursor: btoa('2'), node: { id: '2' } },
    ];

    it('should return true if there are more pages before the current page when using backwards pagination', () => {
      const paginationArgs: PaginationArgs = { last: 1 };
      expect(hasPreviousPage(allEdges, paginationArgs)).toBe(true);
    });

    it('should return true if there are more pages before the current page when using forwards pagination', () => {
      const paginationArgs: PaginationArgs = { after: edge.cursor, first: 1 };
      expect(hasPreviousPage(allEdges, paginationArgs)).toBe(true);
    });

    it('should return false if there are no more pages before the current page', () => {
      const paginationArgs: PaginationArgs = { first: 2 };
      expect(hasPreviousPage(allEdges, paginationArgs)).toBe(false);
    });
  });

  describe('hasNextPage', () => {
    const allEdges: IEdgeType<Node>[] = [
      edge,
      { cursor: btoa('2'), node: { id: '2' } },
    ];

    it('should return true if there are more pages after the current page using forwards pagination', () => {
      const paginationArgs: PaginationArgs = { first: 1 };
      expect(hasNextPage(allEdges, paginationArgs)).toBe(true);
    });

    it('should return true if there are more pages after the current page using backwards pagination', () => {
      const paginationArgs: PaginationArgs = { before: btoa('2'), last: 1 };
      expect(hasNextPage(allEdges, paginationArgs)).toBe(true);
    });

    it('should return false if there are no more pages after the current page', () => {
      const paginationArgs: PaginationArgs = { last: 2 };
      expect(hasNextPage(allEdges, paginationArgs)).toBe(false);
    });
  });

  describe('applyCursorsToEdges', () => {
    const allEdges: IEdgeType<Node>[] = [
      edge,
      { cursor: btoa('2'), node: { id: '2' } },
    ];

    it('should apply cursors to edges for forward pagination', () => {
      const paginationArgs: PaginationArgs = { after: edge.cursor, first: 1 };
      expect(applyCursorsToEdges(allEdges, paginationArgs)).toEqual([
        { cursor: btoa('2'), node: { id: '2' } },
      ]);
    });

    it('should apply cursors to edges for backward pagination', () => {
      const paginationArgs: PaginationArgs = { before: btoa('2'), last: 1 };
      expect(applyCursorsToEdges(allEdges, paginationArgs)).toEqual([edge]);
    });
  });
});
