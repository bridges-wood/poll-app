import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import {
  FirebaseTokens,
  POSTS_COLLECTION,
  USERS_COLLECTION,
} from '@org/firebase';
import { PaginationService } from '@org/graphql/pagination';
import { PubSubTokens } from '@org/pubsub';
import { PostContentType } from '@org/typings';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { User } from '../users/models/user.stub';
import { PostContent, PostContentInput } from './models/contents/index';
import { MultipleChoiceQuestion } from './models/contents/multiple-choice.model';
import { CreatePostArgs } from './models/create-post.args';
import { Post } from './models/post.model';
import { PostDbModel, PostModelMapper } from './models/post.model-mapper';
import { UpdatePostArgs } from './models/update-post.args';

@Injectable()
export class PostsService extends PaginationService<Post, PostDbModel> {
  private readonly logger = new Logger(PostsService.name);
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    @Inject(PubSubTokens.PUBSUB) private readonly pubSub: PubSub,
    private readonly postModelMapper: PostModelMapper,
  ) {
    super(
      Post,
      collection(database, POSTS_COLLECTION).withConverter(postModelMapper),
    );
  }

  async findOneById(id: string): Promise<Post> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`Post with id "${id}" not found`);

    return docSnap.data() as Post;
  }

  streamPost(id: string): AsyncIterator<Post> {
    this.pubSub.registerHandler(`postUpdated:${id}`, (broadcast) => {
      const docRef = doc(this.collectionRef, id);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        broadcast(doc.data() as Post);
      });

      return unsubscribe;
    });

    return this.pubSub.asyncIterator<Post>(`postUpdated:${id}`);
  }

  async createOne(
    args: CreatePostArgs,
    author: Pick<User, 'id'>,
  ): Promise<Post> {
    const post: Omit<Post, 'id'> = {
      content: this.buildContent(args.content),
      caption: args.caption,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Post, 'id'>;

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

    const updateData: { [x: string]: any } = args; // Convert UpdatePostArgs to the expected type

    await updateDoc(postRef, updateData);
    return {
      ...post,
      ...args,
    };
  }

  async deleteOne(id: string): Promise<boolean> {
    return await runTransaction(this.database, async (transaction) => {
      const postRef = doc(this.database, POSTS_COLLECTION, id);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        this.logger.error(`Unable to delete post with id "${id}": not found`);
        return false;
      }

      // Delete post
      transaction.delete(postRef);

      // Remove post from user's posts array
      const post = postDoc.data();
      const userRef = doc(this.database, USERS_COLLECTION, post.author);
      transaction.update(userRef, {
        posts: arrayRemove(postRef),
      });

      return true;
    });
  }
}
