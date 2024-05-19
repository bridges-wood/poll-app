import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  FieldValue,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { Post } from '../../posts/models/post.stub';
import { User } from './user.model';

export interface UserDbModel extends User {}

@Injectable()
export class UserModelMapper
  implements FirestoreDataConverter<User, UserDbModel>
{
  toFirestore(modelObject: WithFieldValue<User>): WithFieldValue<UserDbModel> {
    delete modelObject.id;
    return {
      ...modelObject,
      // If we're not creating a new user, updatedAt should be set
      updatedAt: modelObject.updatedAt ?? new Date(),
    } as WithFieldValue<UserDbModel>;
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, UserDbModel>,
    options?: SnapshotOptions,
  ): User {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      ...data,
      // Firestore returns Timestamp objects, but we want to work with Date objects
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as User;
  }

  private _postsToReferences(
    posts: FieldValue | WithFieldValue<Post[]>,
  ): Post['id'][] | FieldValue {
    if (Array.isArray(posts)) {
      return posts.map((post: Post) => post.id);
    }

    return posts;
  }
}
