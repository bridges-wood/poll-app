import { Injectable } from '@nestjs/common';
// import { User } from '@org/graphql';

@Injectable()
export class AuthService {
  async me() {
    return { id: '1' };
  }

  async login(email: string, password: string) {
    return { id: '1', email };
  }
}
