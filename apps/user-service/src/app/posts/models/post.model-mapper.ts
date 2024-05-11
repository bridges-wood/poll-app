import { Inject, Injectable } from '@nestjs/common';
import { FirebaseTokens } from '@org/firebase';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  doc,
} from 'firebase/firestore';
import { Post } from './post.stub';

interface PostDbModel extends Omit<Post, 'author'> {
  author: DocumentReference;
}

@Injectable()
export class PostModelMapper
  implements FirestoreDataConverter<Post, PostDbModel>
{
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
  ) {}

  toFirestore(modelObject: Post): PostDbModel {
    delete modelObject.id;
    return {
      ...modelObject,
      author: doc(this.database, 'users', modelObject.author.id),
    };
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, PostDbModel>,
    options?: SnapshotOptions,
  ): Post {
    const data = snapshot.data(options) as PostDbModel;

    return {
      id: snapshot.id,
      author: { id: data.author.id },
    } as Post;
  }
}
