import { Inject, Injectable } from '@nestjs/common';
import {
  FirebaseTokens,
  POSTS_COLLECTION,
  USERS_COLLECTION,
} from '@org/firebase';
import {
  doc,
  DocumentData,
  DocumentReference,
  FieldValue,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.stub';
import { Response } from './response.model';

export interface ResponseDbModel
  extends DocumentData,
    Omit<Response, 'author' | 'id' | 'post'> {
  /**
   * Reference to the author of the response.
   */
  author: DocumentReference<User>;
  /**
   * Reference to the post that the response relates to.
   */
  post: DocumentReference<Post>;
}

@Injectable()
export class ResponseModelMapper
  implements FirestoreDataConverter<Response, ResponseDbModel>
{
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
  ) {}

  toFirestore(
    modelObject: WithFieldValue<Response | Omit<Response, 'id'>>,
  ): WithFieldValue<ResponseDbModel> {
    if ('id' in modelObject) {
      delete modelObject.id;
    }

    return {
      ...modelObject,
      author: this.authorToReference(modelObject.author),
      post: this.postToReference(modelObject.post),
      // If we're not creating a new response, updatedAt should be set
      updatedAt: modelObject.updatedAt ?? new Date(),
    };
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, ResponseDbModel>,
    options?: SnapshotOptions,
  ): Response {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      ...data,
      author: this.referenceToAuthor(data.author),
      post: this.referenceToPost(data.post),
      // Firestore returns Timestamp objects, but we want to work with Date objects
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Response;
  }

  private authorToReference(
    author: FieldValue | WithFieldValue<User>,
  ): DocumentReference | FieldValue {
    if ('id' in author) {
      return doc(this.database, USERS_COLLECTION, author.id as string);
    }

    return author;
  }

  private referenceToAuthor(
    authorReference: FieldValue | string,
  ): User | FieldValue {
    if (typeof authorReference === 'string') {
      return { id: authorReference } as User;
    }

    return authorReference;
  }

  private postToReference(
    post: FieldValue | WithFieldValue<Post>,
  ): DocumentReference | FieldValue {
    if ('id' in post) {
      return doc(this.database, POSTS_COLLECTION, post.id as string);
    }

    return post;
  }

  private referenceToPost(
    postReference: FieldValue | string,
  ): Post | FieldValue {
    if (typeof postReference === 'string') {
      return { id: postReference } as Post;
    }

    return postReference;
  }
}
