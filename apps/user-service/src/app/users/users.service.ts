import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirebaseTokens } from '@org/firebase';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { NotFoundError } from '../utils/errors';
import { CreateUserArgs } from './models/create-user.args';
import { UpdateUserArgs } from './models/update-user.args';
import { User } from './models/user.model';
import { UserModelMapper } from './models/user.model-mapper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    private readonly userModelMapper: UserModelMapper
  ) {}

  async findOneById(id: string): Promise<User> {
    const docRef = doc(this.database, 'users', id).withConverter(
      this.userModelMapper
    );
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`User with id "${id}" not found`);

    return docSnap.data() as User;
  }

  async findAll(): Promise<User[]> {
    try {
      const q = query(
        collection(this.database, 'users').withConverter(this.userModelMapper)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => doc.data()) as User[];
    } catch (error) {
      Logger.error(error);
      return [];
    }
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
          firstName: null,
          lastName: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          posts: [],
        };

        Logger.log(`Creating user ${id}`);

        // Save user
        await setDoc(
          doc(this.database, 'users', id).withConverter(this.userModelMapper),
          user
        );

        Logger.log(`Created user ${id}`);

        return {id, ...user};
      } else {
        throw error;
      }
    }
  }

  async updateOne(id: string, args: UpdateUserArgs): Promise<void> {
    try {
      const userRef = doc(this.database, 'users', id).withConverter(
        this.userModelMapper
      );

      return await updateDoc(userRef, args as Partial<User>);
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }
}
