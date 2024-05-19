import {
  CollectionReference,
  DocumentData,
  PartialWithFieldValue,
  QueryConstraint,
  QueryDocumentSnapshot,
  doc,
  endBefore,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { chunk, isUndefined } from 'lodash';
import {
  DEFAULT_CHUNK_SIZE,
  EMPTY_PAGE,
  IConnectionType,
  IEdgeType,
  Node,
  PaginationArgs,
  edgesToReturn,
  isBackwardPagination,
  isForwardPagination,
  nodeToEdge,
  parseCursor,
} from '.';

export abstract class PaginationService<
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
> {
  constructor(
    readonly collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
    readonly chunkSize = DEFAULT_CHUNK_SIZE,
  ) {}

  async findAll(args: PaginationArgs): Promise<IConnectionType<AppModelType>> {
    if (!isForwardPagination(args) && !isBackwardPagination(args))
      throw new Error('At least one of "first" or "last" must be provided');

    const constraints = await this.prepareConstraints(args);
    const q = query(this.collectionRef, ...constraints);

    // TODO add logging

    const querySnapshot = await getDocs(q);
    const totalCount = this.getTotalCount();
    if (querySnapshot.empty) {
      return EMPTY_PAGE;
    }

    const nodes = querySnapshot.docs.map((doc) => doc.data() as AppModelType);
    const allEdges = nodes.map(nodeToEdge);
    const edges = edgesToReturn(allEdges, args);

    return {
      edges,
      totalCount: await totalCount,
      pageInfo: {
        startCursor: edges[0].cursor,
        endCursor: edges[edges.length - 1].cursor,
        hasNextPage: await this.hasNextPage(
          querySnapshot.docs,
          isBackwardPagination(args),
        ),
        hasPreviousPage: await this.hasPreviousPage(
          querySnapshot.docs,
          isBackwardPagination(args),
        ),
        count: edges.length,
      },
    };
  }

  async findByIds(
    ids: Node['id'][],
    args: PaginationArgs,
  ): Promise<IConnectionType<AppModelType>> {
    if (!isForwardPagination(args) && !isBackwardPagination(args))
      throw new Error('At least one of "first" or "last" must be provided');

    // Break the ids into chunks of 30 to avoid Firestore's "in" query limit
    const chunks = this.getChunksForQuery(ids, args);
    if (chunks.length === 0) return EMPTY_PAGE;

    const fetchedChunks = await Promise.all(
      chunks.map((chunk) => this.fetchChunk(chunk)),
    );
    const allEdges = fetchedChunks.flat();
    const edges = edgesToReturn(allEdges, args);
    if (edges.length === 0) return EMPTY_PAGE;

    return {
      edges,
      totalCount: ids.length,
      pageInfo: {
        startCursor: edges[0].cursor,
        endCursor: edges[edges.length - 1].cursor,
        hasNextPage: edges.at(-1)?.node.id !== ids.at(-1),
        hasPreviousPage: edges[0].node.id !== ids[0],
        count: edges.length,
      },
    };
  }

  private getChunksForQuery(
    ids: Node['id'][],
    args: PaginationArgs,
  ): Node['id'][][] {
    if (isForwardPagination(args)) {
      const { after, first } = args;
      let start = -1;
      if (after) {
        const cursorId = parseCursor(after);
        start = ids.findIndex((id) => id === cursorId);
        if (start === -1) throw new Error(`Cursor "${after}" not found`);
      }

      const relevantIds = ids.slice(start + 1, start + first + 1);
      return chunk(relevantIds, this.chunkSize);
    }

    if (isBackwardPagination(args)) {
      const { before, last } = args;
      let end = ids.length;
      if (before) {
        const cursorId = parseCursor(before);
        end = ids.findIndex((id) => id === cursorId);
        if (end === -1) throw new Error(`Cursor "${before}" not found`);
      }

      const relevantIds = ids.slice(end - last, end);
      return chunk(relevantIds, this.chunkSize);
    }

    return [];
  }

  private async fetchChunk(
    chunk: Node['id'][],
  ): Promise<IEdgeType<AppModelType>[]> {
    const q = query(this.collectionRef, where('__name__', 'in', chunk));
    const querySnapshot = await getDocs(q);
    const nodes = querySnapshot.docs.map((doc) => doc.data() as AppModelType);
    return nodes.map(nodeToEdge);
  }

  private async prepareConstraints(
    args: PaginationArgs,
  ): Promise<QueryConstraint[]> {
    const constraints: QueryConstraint[] = [];
    if (isForwardPagination(args)) {
      const { after, first } = args;

      if (!isUndefined(after)) {
        const docRef = doc(this.collectionRef, parseCursor(after));
        const docSnap = await getDoc(docRef);

        constraints.push(startAfter(docSnap));
      }

      constraints.push(limit(first));
    }

    if (isBackwardPagination(args)) {
      const { before, last } = args;
      constraints.push(orderBy('__name__', 'desc'));

      if (!isUndefined(before)) {
        const docRef = doc(this.collectionRef, parseCursor(before));
        const docSnap = await getDoc(docRef);

        constraints.push(startAfter(docSnap));
      }

      constraints.push(limit(last));
    }

    return constraints;
  }

  private async getTotalCount(): Promise<number> {
    const q = query(this.collectionRef);
    const docsResult = await getCountFromServer(q);
    return docsResult.data().count;
  }

  private async hasNextPage(
    docs: QueryDocumentSnapshot<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >[],
    reversed: boolean,
  ): Promise<boolean> {
    const doc = docs.at(reversed ? 0 : -1);

    const q = query(this.collectionRef, startAfter(doc), limit(1));
    // TODO replace with count query (https://github.com/firebase/firebase-js-sdk/issues/8241)
    const docsResult = await getDocs(q);
    return !docsResult.empty;
  }

  private async hasPreviousPage(
    docs: QueryDocumentSnapshot<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >[],
    reversed: boolean,
  ): Promise<boolean> {
    const doc = docs.at(reversed ? -1 : 0);

    const q = query(this.collectionRef, endBefore(doc), limit(1));
    // TODO replace with count query (https://github.com/firebase/firebase-js-sdk/issues/8241)
    const docsResult = await getDocs(q);
    return !docsResult.empty;
  }
}
