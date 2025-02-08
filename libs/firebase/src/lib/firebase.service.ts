import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Node } from '@org/graphql/pagination';
import { InjectionBypass } from '@org/typings';
import {
  CollectionReference,
  DocumentData,
  PartialWithFieldValue,
} from 'firebase/firestore';
import { getRepositoryToken } from './common/firebase.utils';
import { FirebaseModule } from './firebase.module';
import { IRepository } from './firebase.repository';

export type IFirebaseService<
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
> = IRepository<AppModelType, DbModelType>;

export const FirebaseService = <
  AppModelType extends Node,
  DbModelType extends DocumentData = DocumentData,
>(
  appModelRef: Type<AppModelType>,
): InjectionBypass<IFirebaseService<AppModelType, DbModelType>> => {
  @Injectable()
  class FirebaseServiceHost
    implements IFirebaseService<AppModelType, DbModelType>, OnModuleInit
  {
    protected repository!: IRepository<AppModelType, DbModelType>;
    collectionRef!: CollectionReference<
      PartialWithFieldValue<AppModelType>,
      PartialWithFieldValue<DbModelType>
    >;

    constructor(private readonly moduleRef: ModuleRef) {}

    onModuleInit(): void {
      this.repository = this.moduleRef.get<
        IRepository<AppModelType, DbModelType>
      >(getRepositoryToken(appModelRef), { strict: false });

      if (!this.repository) {
        // TODO inject logger
        Logger.fatal(
          `Repository for ${appModelRef.name} not found. Did you forget to import the ${FirebaseModule.name}?`,
        );
        throw new Error(`Repository for ${appModelRef.name} not found.`);
      }

      this.collectionRef = this.repository.collectionRef;
    }

    subscribeById(
      ...args: Parameters<
        IFirebaseService<AppModelType, DbModelType>['subscribeById']
      >
    ): ReturnType<
      IFirebaseService<AppModelType, DbModelType>['subscribeById']
    > {
      return this.repository.subscribeById(...args);
    }

    findOneById(
      ...args: Parameters<
        IFirebaseService<AppModelType, DbModelType>['findOneById']
      >
    ): ReturnType<IFirebaseService<AppModelType, DbModelType>['findOneById']> {
      return this.repository.findOneById(...args);
    }

    findAll(
      ...args: Parameters<
        IFirebaseService<AppModelType, DbModelType>['findAll']
      >
    ): ReturnType<IFirebaseService<AppModelType, DbModelType>['findAll']> {
      return this.repository.findAll(...args);
    }

    findByIds(
      ...args: Parameters<
        IFirebaseService<AppModelType, DbModelType>['findByIds']
      >
    ): ReturnType<IFirebaseService<AppModelType, DbModelType>['findByIds']> {
      return this.repository.findByIds(...args);
    }

    findWithConstraints(
      ...args: Parameters<
        IFirebaseService<AppModelType, DbModelType>['findWithConstraints']
      >
    ): ReturnType<
      IFirebaseService<AppModelType, DbModelType>['findWithConstraints']
    > {
      return this.repository.findWithConstraints(...args);
    }
  }

  return FirebaseServiceHost;
};
