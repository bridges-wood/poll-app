import { Inject, Injectable } from '@nestjs/common';
import { FirebaseTokens, USERS_COLLECTION } from '@org/firebase';
import { PostContentType } from '@org/typings';
import {
  DocumentData,
  DocumentReference,
  FieldValue,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  WithFieldValue,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { User } from '../../users/models/user.stub';
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionDBModel,
} from './contents/multiple-choice.model';
import { Post } from './post.model';

export interface PostDbModel
  extends DocumentData,
    Omit<
      Post,
      'author' | 'responses' | 'id' | 'content' | 'createdAt' | 'updatedAt'
    > {
  /**
   * Reference to the author of the post
   */
  author: DocumentReference<User>;
  /**
   * The content of the post
   */
  content: MultipleChoiceQuestionDBModel;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InitialPost = WithFieldValue<
  Omit<Post, 'id' | 'author' | 'responses'> & {
    author: WithFieldValue<Pick<User, 'id'>>;
  }
>;

@Injectable()
export class PostModelMapper
  implements FirestoreDataConverter<Post, PostDbModel>
{
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
  ) {}

  toFirestore(modelObject: WithFieldValue<Post>): WithFieldValue<PostDbModel> {
    if ('id' in modelObject) {
      delete modelObject.id;
    }

    return {
      ...modelObject,
      content: this.serializeContent(modelObject.content),
      author: this.authorToReference(modelObject.author),
      // If we're not creating a new post, updatedAt should be set
      createdAt:
        modelObject.createdAt instanceof FieldValue
          ? modelObject.createdAt
          : Timestamp.fromDate(modelObject.createdAt as Date),
      updatedAt: serverTimestamp(),
    };
  }

  serializeContent(
    content: FieldValue | WithFieldValue<MultipleChoiceQuestion>,
  ): FieldValue | WithFieldValue<MultipleChoiceQuestionDBModel> {
    if ('type' in content) {
      switch (content.type) {
        case PostContentType.MULTIPLE_CHOICE:
          return {
            type: PostContentType.MULTIPLE_CHOICE,
            question: content.question,
            options: content.options,
            voteTotals: Object.fromEntries(
              (content.voteTotals as number[]).map((total, idx) => [
                idx,
                total,
              ]),
            ),
          };
      }
    } else {
      return content;
    }
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot<PostDbModel>,
    options?: SnapshotOptions,
  ): Post {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      content: this.deserializeContent(data.content),
      author: this.referenceToAuthor(data.author),
      // Firestore returns Timestamp objects, but we want to work with Date objects
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Post;
  }

  private deserializeContent(
    content: MultipleChoiceQuestionDBModel,
  ): MultipleChoiceQuestion {
    switch (content.type) {
      case PostContentType.MULTIPLE_CHOICE:
        return {
          type: PostContentType.MULTIPLE_CHOICE,
          question: content.question,
          options: content.options,
          voteTotals: Object.values(content.voteTotals),
        };
    }
  }

  private authorToReference(
    author: FieldValue | WithFieldValue<User>,
  ): DocumentReference | FieldValue {
    if ('id' in author) {
      return doc(this.database, USERS_COLLECTION, author.id as string);
    }

    return author;
  }

  private referenceToAuthor(authorReference: DocumentReference<User>): User {
    return {
      id: authorReference.id,
    } as User;
  }
}
