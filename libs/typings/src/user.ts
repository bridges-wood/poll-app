import { Post } from './posts';

export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  posts: Post[];
  createdAt: Date;
  updatedAt: Date;
}
