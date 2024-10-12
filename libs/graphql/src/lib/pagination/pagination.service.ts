import { Logger, Type } from '@nestjs/common';
import { TypeMetadataStorage } from '@nestjs/graphql';
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
import { chunk, isArray, isEmpty, isNil, isUndefined, uniq } from 'lodash';
import {
  DEFAULT_CHUNK_SIZE,
  EMPTY_PAGE,
  IBackwardPagination,
  IConnectionType,
  IEdgeType,
  IForwardPagination,
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
  protected readonly logger = new Logger(this.constructor.name);
  constructor(
    readonly classRef: Type<AppModelType> | readonly [Type<AppModelType>],
    readonly collectionRef?: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
    readonly chunkSize = DEFAULT_CHUNK_SIZE,
  ) {}

  async findAll(
    args: PaginationArgs,
    options?: {
      collectionRefOverride?: CollectionReference<
        PartialWithFieldValue<AppModelType>,
        PartialWithFieldValue<DbModelType>
      >;
    },
  ): Promise<IConnectionType<AppModelType>> {
    const collectionRef = options?.collectionRefOverride || this.collectionRef;
    if (!collectionRef)
      throw new Error('Collection reference must be provided');
    this.logger.debug(`Using collection reference: ${collectionRef.path}`);

    if (!isForwardPagination(args) && !isBackwardPagination(args))
      throw new Error('At least one of "first" or "last" must be provided');

    const constraints = await this.prepareConstraints(args, collectionRef);
    const q = query(collectionRef, ...constraints);
    this.logger.debug(
      `Querying with constraints: ${JSON.stringify(constraints)}`,
    );

    const querySnapshot = await getDocs(q);
    const totalCount = this.getTotalCount(collectionRef);

    if (querySnapshot.empty) {
      return EMPTY_PAGE;
    }

    const nodes = querySnapshot.docs.map((doc) => doc.data() as AppModelType);
    const allEdges = nodes.map(nodeToEdge);
    const edges = edgesToReturn(allEdges, args);
    this.logger.debug(`Returning ${edges.length} edges`);

    return {
      edges,
      totalCount: await totalCount,
      pageInfo: {
        startCursor: edges[0].cursor,
        endCursor: edges[edges.length - 1].cursor,
        hasNextPage: await this.hasNextPage(
          querySnapshot.docs,
          isBackwardPagination(args),
          collectionRef,
        ),
        hasPreviousPage: await this.hasPreviousPage(
          querySnapshot.docs,
          isBackwardPagination(args),
          collectionRef,
        ),
        count: edges.length,
      },
    };
  }

  async findByIds(
    ids: Node['id'][],
    args: PaginationArgs,
    options?: {
      collectionRefOverride?: CollectionReference<
        PartialWithFieldValue<AppModelType>,
        PartialWithFieldValue<DbModelType>
      >;
    },
  ): Promise<IConnectionType<AppModelType>> {
    const collectionRef = options?.collectionRefOverride || this.collectionRef;
    if (!collectionRef)
      throw new Error('Collection reference must be provided');
    this.logger.debug(`Using collection reference: ${collectionRef.path}`);

    if (!isForwardPagination(args) && !isBackwardPagination(args))
      throw new Error('At least one of "first" or "last" must be provided');

    // Break the ids into chunks of 30 to avoid Firestore's "in" query limit
    const chunks = this.getChunksForQuery(ids, args);
    if (chunks.length === 0) return EMPTY_PAGE;
    this.logger.debug(`Splitting ids into ${chunks.length} chunks`);

    const fetchedChunks = await Promise.all(
      chunks.map((chunk) => this.fetchChunk(chunk, collectionRef)),
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

  async findWithConstraints(
    args: PaginationArgs,
    constraints: QueryConstraint[],
    options?: {
      collectionRefOverride?: CollectionReference<
        PartialWithFieldValue<AppModelType>,
        PartialWithFieldValue<DbModelType>
      >;
    },
  ): Promise<IConnectionType<AppModelType>> {
    const collectionRef = options?.collectionRefOverride || this.collectionRef;
    if (!collectionRef)
      throw new Error('Collection reference must be provided');
    this.logger.debug(`Using collection reference: ${collectionRef.path}`);

    if (!isForwardPagination(args) && !isBackwardPagination(args))
      throw new Error('At least one of "first" or "last" must be provided');

    const q = query(collectionRef, ...constraints);
    this.logger.debug(
      `Querying with constraints: ${JSON.stringify(constraints)}`,
    );

    const querySnapshot = await getDocs(q);
    const totalCount = this.getTotalCount(collectionRef);

    if (querySnapshot.empty) {
      return EMPTY_PAGE;
    }

    const nodes = querySnapshot.docs.map((doc) => doc.data() as AppModelType);
    const allEdges = nodes.map(nodeToEdge);
    const edges = edgesToReturn(allEdges, args);
    this.logger.debug(`Returning ${edges.length} edges`);

    return {
      edges,
      totalCount: await totalCount,
      pageInfo: {
        startCursor: edges[0].cursor,
        endCursor: edges[edges.length - 1].cursor,
        hasNextPage: await this.hasNextPage(
          querySnapshot.docs,
          isBackwardPagination(args),
          collectionRef,
        ),
        hasPreviousPage: await this.hasPreviousPage(
          querySnapshot.docs,
          isBackwardPagination(args),
          collectionRef,
        ),
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
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<IEdgeType<AppModelType>[]> {
    const q = query(collectionRef, where('__name__', 'in', chunk));
    const querySnapshot = await getDocs(q);
    const nodes = querySnapshot.docs.map((doc) => doc.data() as AppModelType);
    return nodes.map(nodeToEdge);
  }

  private async prepareConstraints(
    args: PaginationArgs,
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<QueryConstraint[]> {
    let constraints: QueryConstraint[] = [this.prepareSortConstraint(args)];
    if (isForwardPagination(args)) {
      constraints = await this.prepareForwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );
    }

    if (isBackwardPagination(args)) {
      constraints = await this.prepareBackwardPaginationConstraints(
        args,
        constraints,
        collectionRef,
      );
    }

    return constraints;
  }

  private getValidSortByFields(): string[] {
    let fields: string[] = [];
    if (typeof this.classRef === 'object' && isArray(this.classRef)) {
      // If multiple classes are provided, return the union of all fields
      fields = uniq(this.classRef.map((ref) => this.getFields(ref)).flat());
    } else {
      // If only one class is provided, return its fields
      fields = uniq(this.getFields(this.classRef as Type<any>));
    }

    if (fields.length === 0) throw new Error('No fields found');
    return fields;
  }

  private getFields(ref: Type<any>): string[] {
    const objectTypeMetadata =
      TypeMetadataStorage.getObjectTypeMetadataByTarget(ref);

    let interfaceFields: string[] = [];
    if (objectTypeMetadata?.interfaces) {
      // If the object type implements interfaces, include their fields
      if (typeof objectTypeMetadata.interfaces === 'function') {
        const interfaces: Type<any> | Type<any>[] =
          objectTypeMetadata.interfaces();
        if (typeof interfaces === 'function') {
          interfaceFields = this.getInterfaceFields(interfaces);
        } else {
          interfaceFields = interfaces
            .map((i) => this.getInterfaceFields(i))
            .flat();
        }
      } else {
        interfaceFields = objectTypeMetadata.interfaces
          .map((i) => this.getInterfaceFields(i as Type<any>))
          .flat();
      }
    }

    if (!objectTypeMetadata) {
      throw new Error(`No fields found for ${ref.name}`);
    }

    return (
      objectTypeMetadata.properties
        ?.map((prop) => prop.name)
        .concat('id')
        .concat(interfaceFields) || []
    );
  }

  private getInterfaceFields(ref: Type<any>): string[] {
    const interfaceMetadata =
      TypeMetadataStorage.getInterfaceMetadataByTarget(ref);

    if (!interfaceMetadata) {
      throw new Error(`No fields found for ${ref.name}`);
    }

    return interfaceMetadata.properties?.map((prop) => prop.name) || [];
  }

  protected prepareSortConstraint(args: PaginationArgs): QueryConstraint {
    const validSortByFields = this.getValidSortByFields();
    let sortBy = args.orderBy;
    if (sortBy && !validSortByFields.includes(sortBy)) {
      throw new Error(
        `Invalid sortBy field "${sortBy}". Valid fields are: ${validSortByFields.join(
          ', ',
        )}.`,
      );
    }

    if (isNil(sortBy) || sortBy === 'id') sortBy = '__name__';

    if (isForwardPagination(args)) {
      return orderBy(sortBy, 'asc');
    }

    if (isBackwardPagination(args)) {
      return orderBy(sortBy, 'desc');
    }

    throw new Error('Invalid pagination arguments');
  }

  private async prepareForwardPaginationConstraints(
    args: IForwardPagination,
    constraints: QueryConstraint[],
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<QueryConstraint[]> {
    const { after, first } = args;

    if (!isUndefined(after)) {
      if (isEmpty(after)) throw new Error('After cannot be an empty string');
      const docRef = doc(collectionRef, parseCursor(after));
      const docSnap = await getDoc(docRef); // TODO assess cost of this

      constraints.push(startAfter(docSnap));
    }

    constraints.push(limit(first));
    return constraints;
  }

  private async prepareBackwardPaginationConstraints(
    args: IBackwardPagination,
    constraints: QueryConstraint[],
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<QueryConstraint[]> {
    const { before, last } = args;

    if (!isUndefined(before)) {
      if (isEmpty(before)) throw new Error('Before cannot be an empty string');
      const docRef = doc(collectionRef, parseCursor(before));
      const docSnap = await getDoc(docRef); // TODO assess cost of this

      constraints.push(startAfter(docSnap));
    }

    constraints.push(limit(last));
    return constraints;
  }

  private async getTotalCount(
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<number> {
    const q = query(collectionRef);
    const docsResult = await getCountFromServer(q);
    return docsResult.data().count;
  }

  private async hasNextPage(
    docs: QueryDocumentSnapshot<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >[],
    reversed: boolean,
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<boolean> {
    const doc = docs.at(reversed ? 0 : -1);

    const q = query(collectionRef, startAfter(doc), limit(1));
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
    collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
  ): Promise<boolean> {
    const doc = docs.at(reversed ? -1 : 0);

    const q = query(collectionRef, endBefore(doc), limit(1));
    // TODO replace with count query (https://github.com/firebase/firebase-js-sdk/issues/8241)
    const docsResult = await getDocs(q);
    return !docsResult.empty;
  }
}
