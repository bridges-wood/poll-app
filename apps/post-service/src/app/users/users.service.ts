import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens } from '@org/firebase';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { PostModelMapper } from '../posts/models/post.model-mapper';
import { InternalUser } from './models/user.stub';

@Injectable()
export class UsersService {
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    private readonly postModelMapper: PostModelMapper,
  ) {}

  async userById(id: string): Promise<InternalUser> {
    const postsRef = collection(this.database, 'posts').withConverter(
      this.postModelMapper,
    );
    const q = query(
      postsRef,
      where('author', '==', doc(this.database, 'users', id)),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new NotFoundError(`No posts were found with author id "${id}"`);
    }

    return {
      id,
      posts: querySnapshot.docs.map((doc) => doc.id),
    };
  }
}
