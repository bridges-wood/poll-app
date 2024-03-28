export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  posts: Post[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  caption: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}