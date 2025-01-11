import { Test, TestingModule } from '@nestjs/testing';
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { User } from './user.model';
import { UserDbModel, UserModelMapper } from './user.model-mapper';

describe('UserModelMapper', () => {
  let userModelMapper: UserModelMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserModelMapper],
    }).compile();

    userModelMapper = module.get<UserModelMapper>(UserModelMapper);
  });

  it('should be defined', () => {
    expect(userModelMapper).toBeDefined();
  });

  describe('fromFirestore', () => {
    it('should map Firestore data to User model', () => {
      const snapshot: QueryDocumentSnapshot<DocumentData, UserDbModel> = {
        id: 'user-id',
        data: jest.fn().mockReturnValue({
          name: 'John Doe',
          email: 'john.doe@example.com',
        }),
      } as unknown as QueryDocumentSnapshot<DocumentData, UserDbModel>;
      const options: SnapshotOptions = {};

      const user: User = userModelMapper.fromFirestore(snapshot, options);

      expect(user).toEqual({
        id: 'user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
    });
  });

  describe('toFirestore', () => {
    it('should throw an error when called', () => {
      expect(() => {
        userModelMapper.toFirestore({
          id: 'user-id',
          email: 'john.doe@example.com',
        } as User);
      }).toThrow(new Error('Should not be called'));
    });
  });
});
