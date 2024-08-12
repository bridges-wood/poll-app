import { User } from '../user';
import { MultipleChoiceQuestion } from './multiple-choice';
export * from './multiple-choice';

export interface Post {
  id: string;
  content: PostContent;
  caption?: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export interface PostContent {
  type: PostContentType;
}

export enum PostContentType {
  MULTIPLE_CHOICE = 'MultipleChoiceQuestion',
}

export interface PostResponse {
  id: string;
  author: User;
  post: Post;
  type: PostContentType;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}
