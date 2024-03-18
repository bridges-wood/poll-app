import { Injectable } from '@nestjs/common';
import { User } from '@org/graphql/nest';

@Injectable()
export class AuthService {
  async me(): Promise<User> {
    const date = new Date();
    return {
      id: '1',
      createdAt: date,
      updatedAt: date,
      email: 'john@apple.com',
      displayName: 'John Appleseed',
      posts: [],
    };
  }

  // async login(email: string, password: string) {
  //   return { id: '1', email };
  // }
}
