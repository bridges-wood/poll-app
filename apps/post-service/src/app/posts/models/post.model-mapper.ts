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
  WithFieldValue,
  doc,
} from 'firebase/firestore';
import { User } from '../../users/models/user.stub';
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionDBModel,
} from './contents/multiple-choice.model';
import { Post } from './post.model';

export interface PostDbModel
  extends DocumentData,
    Omit<Post, 'author' | 'responses' | 'id' | 'content'> {
  /**
   * Reference to the author of the post
   */
  author: DocumentReference<User>;
  /**
   * The content of the post
   */
  content: MultipleChoiceQuestionDBModel;
}

@Injectable()
export class PostModelMapper
  implements FirestoreDataConverter<Post, PostDbModel>
{
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
  ) {}

  toFirestore(
    modelObject: WithFieldValue<Post | Omit<Post, 'id'>>,
  ): WithFieldValue<PostDbModel> {
    if ('id' in modelObject) {
      delete modelObject.id;
    }

    return {
      ...modelObject,
      content: this.serializeContent(modelObject.content),
      author: this.authorToReference(modelObject.author),
      // If we're not creating a new post, updatedAt should be set
      updatedAt: modelObject.updatedAt ?? new Date(),
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
    snapshot: QueryDocumentSnapshot<DocumentData, PostDbModel>,
    options?: SnapshotOptions,
  ): Post {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      content: this.deseralizeContent(data.content),
      author: this.referenceToAuthor(data.author),
      // Firestore returns Timestamp objects, but we want to work with Date objects
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Post;
  }

  private deseralizeContent(
    content: FieldValue | MultipleChoiceQuestionDBModel,
  ): FieldValue | MultipleChoiceQuestion {
    if ('type' in content) {
      switch (content.type) {
        case PostContentType.MULTIPLE_CHOICE:
          return {
            type: PostContentType.MULTIPLE_CHOICE,
            question: content.question,
            options: content.options,
            voteTotals: Object.values(content.voteTotals),
          };
      }
    } else {
      return content;
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

  private referenceToAuthor(
    authorReference: FieldValue | string,
  ): User | FieldValue {
    if (typeof authorReference === 'string') {
      return { id: authorReference } as User;
    }

    return authorReference;
  }
}
