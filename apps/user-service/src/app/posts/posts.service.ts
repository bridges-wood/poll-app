import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens } from '@org/firebase';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { UsersService } from '../users/users.service';
import { PostModelMapper } from './models/post.model-mapper';
import { Post } from './models/post.stub';

@Injectable()
export class PostsService {
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    private readonly postModelMapper: PostModelMapper,
    private readonly userService: UsersService,
  ) {}

  async postById(id: string): Promise<Post> {
    const postRef = doc(this.database, 'posts', id).withConverter(
      this.postModelMapper,
    );
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new NotFoundError(`Post with id "${id}" not found`);
    }

    const post = postSnap.data();

    return { id, author: await this.userService.findOneById(post.author.id) };
  }
}
