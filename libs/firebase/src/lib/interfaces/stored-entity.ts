import { Type } from '@nestjs/common';
import { Node } from '@org/graphql/pagination';
import { DocumentData, FirestoreDataConverter } from 'firebase/firestore';

export interface IStoredEntity<
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
> {
  new (...args: unknown[]): AppModelType; // Must be applied to a class
  collectionName: string;
  modelMapper: Type<FirestoreDataConverter<AppModelType, DbModelType>>;
}
