import { Injectable, Logger } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  async findOneById(id: string): Promise<User> {
    Logger.log(`findOneById: ${id}`);
    return {
      id,
      name: 'John Doe',
    };
  }
}
