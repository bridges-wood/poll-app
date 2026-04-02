import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ResourceOwnershipProvider } from '@org/auth';
import {
  FirebaseService,
  FirebaseTokens,
  USERS_COLLECTION,
} from '@org/firebase';
import { BaseLogger } from '@org/log';
import { PostContentType } from '@org/typings';
import {
  arrayRemove,
  arrayUnion,
  doc,
  Firestore,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { User } from '../users/models/user.stub';
import { PostContent, PostContentInput } from './models/contents/index';
import { MultipleChoiceQuestion } from './models/contents/multiple-choice.model';
import { CreatePostArgs } from './models/create-post.args';
import { Post } from './models/post.model';
import { InitialPost, PostDbModel } from './models/post.model-mapper';
import { UpdatePostArgs } from './models/update-post.args';

@Injectable()
export class PostsService
  extends FirebaseService<Post, PostDbModel>(Post)
  implements ResourceOwnershipProvider
{
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    moduleRef: ModuleRef,
    readonly logger: BaseLogger,
  ) {
    super(moduleRef);
    this.logger.setContext(PostsService.name);
  }

  async createOne(
    args: CreatePostArgs,
    author: Pick<User, 'id'>,
  ): Promise<Post> {
    const post: InitialPost = {
      content: this.buildContent(args.content),
      caption: args.caption,
      author,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const id = await runTransaction(this.database, async (transaction) => {
      const postRef = doc(this.collectionRef);
      // Save post
      transaction.set(postRef, post);

      this.logger.log(`Created post with id "${postRef.id}"`);

      // Update the posts array in the user document
      const userRef = doc(this.database, USERS_COLLECTION, author.id);
      // TODO replace this with a subcollection
      transaction.update(userRef, {
        posts: arrayUnion(postRef),
      });

      this.logger.log(`Added post "${postRef.id}" to user "${author.id}"`);
      return postRef.id;
    });

    return { id, ...post } as Post;
  }

  private buildContent(content: PostContentInput): typeof PostContent {
    // Check which field is present in the content
    if ('multipleChoiceQuestion' in content) {
      return {
        type: PostContentType.MULTIPLE_CHOICE,
        question: content.multipleChoiceQuestion.question,
        options: content.multipleChoiceQuestion.options,
        voteTotals: content.multipleChoiceQuestion.options.map(() => 0),
      } as MultipleChoiceQuestion;
    } else {
      throw new Error('Invalid content type');
    }
  }

  async updateOne(id: string, args: UpdatePostArgs): Promise<Post> {
    const postRef = doc(this.collectionRef, id);

    const post = await this.findOneById(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: { [x: string]: any } = args; // Convert UpdatePostArgs to the expected type

    await updateDoc(postRef, updateData);
    return {
      ...post,
      ...args,
    };
  }

  async deleteOne(id: string): Promise<boolean> {
    return await runTransaction(this.database, async (transaction) => {
      const postRef = doc(this.collectionRef.withConverter(null), id);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        this.logger.error(`Unable to delete post with id "${id}": not found`);
        return false;
      }

      const post = postDoc.data();

      transaction.delete(postRef);

      const userRef = doc(this.database, USERS_COLLECTION, post.author);
      transaction.update(userRef, {
        posts: arrayRemove(postRef),
      });

      return true;
    });
  }
}
