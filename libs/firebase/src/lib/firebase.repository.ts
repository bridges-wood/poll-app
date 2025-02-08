import { Type } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import {
  IPaginationService,
  Node,
  PaginationService,
} from '@org/graphql/pagination';
import {
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  PartialWithFieldValue,
} from 'firebase/firestore';

export interface IRepository<
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
> extends IPaginationService<AppModelType, DbModelType> {
  readonly collectionRef: CollectionReference<
    PartialWithFieldValue<AppModelType>,
    PartialWithFieldValue<DbModelType>
  >;

  findOneById(id: string): Promise<AppModelType>;
}

export class Repository<
  AppModelType extends Node,
  DbModelType extends DocumentData,
> implements IRepository<AppModelType, DbModelType>
{
  constructor(
    readonly collectionRef: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >,
    private readonly paginationService: PaginationService<
      AppModelType,
      DbModelType
    >,
    private readonly classRef: Type<AppModelType>,
  ) {}

  async findOneById(id: string): Promise<AppModelType> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(
        `${this.classRef.name} with id "${id}" not found`,
      );

    return docSnap.data() as AppModelType;
  }

  findAll = this.paginationService.findAll.bind(this.paginationService);

  findByIds = this.paginationService.findByIds.bind(this.paginationService);

  findWithConstraints = this.paginationService.findWithConstraints.bind(
    this.paginationService,
  );
}
