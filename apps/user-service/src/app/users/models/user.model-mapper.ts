import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { User } from './user.model';

@Injectable()
export class UserModelMapper implements FirestoreDataConverter<User> {
  toFirestore(modelObject: WithFieldValue<User>): WithFieldValue<DocumentData> {
    delete modelObject.id;
    return { ...modelObject };
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>,
    options?: SnapshotOptions
  ): User {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as User;
  }
}
