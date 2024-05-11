import { Post } from './posts';
import { User } from './user';

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  createdAt: Date;
  updatedAt: Date;
}
