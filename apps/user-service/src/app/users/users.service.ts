import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NotFoundError } from '@org/errors';
import { FirebaseService } from '@org/firebase';
import { BaseLogger } from '@org/log';
import {
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { CreateUserArgs } from './models/create-user.args';
import { UpdateUserArgs } from './models/update-user.args';
import { User } from './models/user.model';
import { UserDbModel } from './models/user.model-mapper';

@Injectable()
export class UsersService extends FirebaseService<User, UserDbModel>(User) {
  constructor(
    moduleRef: ModuleRef,
    readonly logger: BaseLogger,
  ) {
    super(moduleRef);
    this.logger.setContext(UsersService.name);
  }

  async findOneById(id: string): Promise<User> {
    this.logger.debug(`Finding user with id ${id}`);
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`User with id "${id}" not found`);

    return docSnap.data() as User;
  }

  streamUser(id: string): AsyncIterableIterator<User> {
    return this.subscribeById(id);
  }

  /**
   * Creates a new user in the database
   * @param id The user's uid from Firebase Auth
   * @param args The user's data
   * @returns The created user
   * @throws {Error} If the user already exists
   */
  async createOne(id: string, args: CreateUserArgs): Promise<User> {
    // Check if user exists
    try {
      await this.findOneById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        // If the user doesn't exist, create a new user
        const user: User = {
          id,
          email: args.email,
          displayName: args.displayName,
          profilePicture: args.profilePicture,
          firstName: null,
          lastName: null,
          roles: ['user'],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        Logger.log(`Creating user ${id}`);

        // Save user
        await setDoc(doc(this.collectionRef, id), user);

        Logger.log(`Created user ${id}`);

        return user;
      } else {
        throw error;
      }
    }
  }

  async updateOne(id: string, args: UpdateUserArgs): Promise<User> {
    const userRef = doc(this.collectionRef, id);
    // Check that the username is unique
    const user = await this.findOneById(id);
    if (args.displayName && args.displayName !== user.displayName) {
      const q = query(
        this.collectionRef,
        where('displayName', '==', args.displayName),
        where(documentId(), '!=', id),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('Display name is already taken');
      }
    }

    await updateDoc(userRef, args);
    return {
      ...user,
      ...args,
    };
  }
}
