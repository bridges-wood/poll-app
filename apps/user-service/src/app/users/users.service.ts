import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '@org/errors';
import { FirebaseTokens } from '@org/firebase';
import { PubSubTokens } from '@org/pubsub';
import {
  Firestore,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import PubSub from 'graphql-firestore-subscriptions';
import { CreateUserArgs } from './models/create-user.args';
import { UpdateUserArgs } from './models/update-user.args';
import { User } from './models/user.model';
import { UserModelMapper } from './models/user.model-mapper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(FirebaseTokens.DATABASE) private readonly database: Firestore,
    @Inject(PubSubTokens.PUBSUB) private readonly pubSub: PubSub,
    private readonly userModelMapper: UserModelMapper,
  ) {}

  async findOneById(id: string): Promise<User> {
    const docRef = doc(this.database, 'users', id).withConverter(
      this.userModelMapper,
    );
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      throw new NotFoundError(`User with id "${id}" not found`);

    return docSnap.data() as User;
  }

  async findAll(): Promise<User[]> {
    const q = query(
      collection(this.database, 'users').withConverter(this.userModelMapper),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => doc.data()) as User[];
  }

  streamUser(id: string): AsyncIterator<User> {
    this.pubSub.registerHandler(`userUpdated:${id}`, (broadcast) => {
      const docRef = doc(this.database, 'users', id).withConverter(
        this.userModelMapper,
      );

      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          broadcast(docSnap.data() as User);
        }
      });
    });

    return this.pubSub.asyncIterator(`userUpdated:${id}`);
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
        await setDoc(
          doc(this.database, 'users', id).withConverter(this.userModelMapper),
          user,
        );

        Logger.log(`Created user ${id}`);

        return user;
      } else {
        throw error;
      }
    }
  }

  async updateOne(id: string, args: UpdateUserArgs): Promise<User> {
    const userRef = doc(this.database, 'users', id).withConverter(
      this.userModelMapper,
    );

    // Check that the username is unique
    const user = await this.findOneById(id);
    if (args.displayName && args.displayName !== user.displayName) {
      const q = query(
        collection(this.database, 'users').withConverter(this.userModelMapper),
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
