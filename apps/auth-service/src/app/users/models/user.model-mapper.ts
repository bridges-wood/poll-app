import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { User } from './user.model';

export type UserDbModel = User;

@Injectable()
export class UserModelMapper
  implements FirestoreDataConverter<User, UserDbModel>
{
  toFirestore(_modelObject: WithFieldValue<User>): WithFieldValue<UserDbModel> {
    throw new Error('Should not be called');
  }
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, UserDbModel>,
    options?: SnapshotOptions,
  ): User {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      ...data,
    } as User;
  }
}
