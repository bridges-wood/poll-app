import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens } from '@org/firebase';
import { PubSubTokens } from '@org/pubsub';
import { PostContentType } from '@org/typings';
import {
  Firestore,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import PubSub from 'graphql-firestore-subscriptions';
import { User } from '../users/models/user.stub';
import { PostContent, PostContentInput } from './models/contents/index';
import { MultipleChoiceQuestion } from './models/contents/multiple-choice.model';
import { CreatePostArgs } from './models/create-post.args';
import { Post } from './models/post.model';
import { PostModelMapper } from './models/post.model-mapper';
import { UpdatePostArgs } from './models/update-post.args';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    @Inject(PubSubTokens.PUBSUB) private readonly pubSub: PubSub,
    private readonly postModelMapper: PostModelMapper,
  ) {}

  async findOneById(id: string): Promise<Post> {
    const docRef = doc(this.database, 'posts', id).withConverter(
      this.postModelMapper,
    );
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`Post with id "${id}" not found`);

    return docSnap.data() as Post;
  }

  async findAll(): Promise<Post[]> {
    const q = query(
      collection(this.database, 'posts').withConverter(this.postModelMapper),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => doc.data()) as Post[];
  }

  streamPost(id: string): AsyncIterator<Post> {
    this.pubSub.registerHandler(`postUpdated:${id}`, (broadcast) => {
      const docRef = doc(this.database, 'posts', id).withConverter(
        this.postModelMapper,
      );
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
      author: author,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Post, 'id'>;

    const id = await runTransaction(this.database, async (transaction) => {
      const postRef = doc(collection(this.database, 'posts'));
      // Save post
      transaction.set(postRef.withConverter(this.postModelMapper), post);

      this.logger.log(`Created post with id "${postRef.id}"`);

      // Update the posts array in the user document
      const userRef = doc(this.database, 'users', author.id);
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
        responses: [],
      } as MultipleChoiceQuestion;
    } else {
      throw new Error('Invalid content type');
    }
  }

  async updateOne(id: string, args: UpdatePostArgs): Promise<Post> {
    const postRef = doc(this.database, 'posts', id).withConverter(
      this.postModelMapper,
    );

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
      const postRef = doc(this.database, 'posts', id);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        this.logger.error(`Unable to delete post with id "${id}": not found`);
        return false;
      }

      // Delete post
      transaction.delete(postRef);

      // Remove post from user's posts array
      const post = postDoc.data();
      const userRef = doc(this.database, 'users', post.author);
      transaction.update(userRef, {
        posts: arrayRemove(postRef),
      });

      return true;
    });
  }
}
