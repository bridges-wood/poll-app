import PubSub from '@bridges-wood/graphql-firestore-subscriptions';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import {
  FirebaseTokens,
  POSTS_COLLECTION,
  USERS_COLLECTION,
} from '@org/firebase';
import { PaginationArgs, PaginationService } from '@org/graphql/pagination';
import { BaseLogger } from '@org/log';
import { PubSubTokens } from '@org/pubsub';
import { PostContentType } from '@org/typings';
import {
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  runTransaction,
  where,
} from 'firebase/firestore';
import { User } from '../users/models/user.stub';
import {
  MultipleChoiceResponse,
  MultipleChoiceResponseInput,
} from './models/multiple-choice.model';
import {
  Response,
  ResponseConnection,
  ResponseInput,
} from './models/response.model';
import {
  ResponseDbModel,
  ResponseModelMapper,
} from './models/response.model-mapper';

@Injectable()
export class ResponsesService extends PaginationService<
  Response,
  ResponseDbModel
> {
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    @Inject(PubSubTokens.PUBSUB) private readonly pubSub: PubSub,
    private readonly responseModelMapper: ResponseModelMapper,
    override readonly logger: BaseLogger,
  ) {
    super([MultipleChoiceResponse], logger);
    this.logger.setContext(ResponsesService.name);
  }

  async findAllByPostId(
    postId: string,
    args: PaginationArgs,
  ): Promise<ResponseConnection> {
    const collectionRefOverride = collection(
      this.database,
      POSTS_COLLECTION,
      postId,
      'responses',
    ).withConverter(this.responseModelMapper);

    return this.findAll(args, { collectionRefOverride });
  }

  async findAllByUserId(
    postId: string,
    userId: string,
    args: PaginationArgs,
  ): Promise<ResponseConnection> {
    const collectionRefOverride = collection(
      this.database,
      POSTS_COLLECTION,
      postId,
      'responses',
    ).withConverter(this.responseModelMapper);

    const userRef = doc(this.database, USERS_COLLECTION, userId);

    return this.findWithConstraints(args, [where('author', '==', userRef)], {
      collectionRefOverride,
    });
  }

  async createResponse(
    postId: string,
    args: ResponseInput,
    user: Pick<User, 'id'>,
  ): Promise<Response> {
    const postRef = doc(this.database, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists())
      throw new NotFoundError(`Post with id "${postId}" not found`);

    if ('multipleChoiceResponse' in args) {
      if (postSnap.data().content.type !== PostContentType.MULTIPLE_CHOICE)
        throw new Error(
          'Cannot submit a multiple choice response to a non-multiple choice post',
        );

      return this.submitMultipleChoiceResponse(
        postSnap,
        args.multipleChoiceResponse,
        user,
      );
    } else {
      throw new Error('Invalid response type');
    }
  }

  private async submitMultipleChoiceResponse(
    postSnap: DocumentSnapshot,
    multipleChoiceResponse: MultipleChoiceResponseInput,
    author: Pick<User, 'id'>,
  ): Promise<MultipleChoiceResponse> {
    const response: Omit<MultipleChoiceResponse, 'id'> = {
      ...multipleChoiceResponse,
      author,
      post: { id: postSnap.id },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<MultipleChoiceResponse, 'id'>;

    const id = await runTransaction(this.database, async (transaction) => {
      const post = await transaction.get(postSnap.ref);

      const newVoteTotals: number[] = Object.values(
        post.data().content.voteTotals,
      );
      newVoteTotals[multipleChoiceResponse.selectedOption]++;

      // Update the vote totals
      transaction.update(postSnap.ref, {
        'content.voteTotals': Object.fromEntries(
          newVoteTotals.map((total, idx) => [idx, total]),
        ),
      });

      // Save the response
      const responseRef = doc(
        collection(this.database, POSTS_COLLECTION, postSnap.id, 'responses'),
      ).withConverter(this.responseModelMapper);
      transaction.set(responseRef, response);

      return responseRef.id;
    });

    return { id, ...response } as MultipleChoiceResponse;
  }
}
