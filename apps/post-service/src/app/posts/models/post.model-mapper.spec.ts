import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseTokens } from '@org/firebase';
import { PostContentType } from '@org/typings';
import {
  deleteField,
  doc,
  DocumentReference,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  WithFieldValue,
} from 'firebase/firestore';
import { User } from '../../users/models/user.stub';
import { MultipleChoiceQuestion } from './contents/multiple-choice.model';
import { Post } from './post.model';
import { PostDbModel, PostModelMapper } from './post.model-mapper';

jest.mock('firebase/auth');
jest.mock('firebase/firestore', () => {
  const firestore = jest.requireActual('firebase/firestore');
  return {
    ...firestore,
    doc: jest.fn(),
  };
});

describe('PostModelMapper', () => {
  let postModelMapper: PostModelMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostModelMapper,
        {
          provide: FirebaseTokens.DATABASE,
          useValue: {},
        },
      ],
    }).compile();

    postModelMapper = module.get<PostModelMapper>(PostModelMapper);
  });

  it('should be defined', () => {
    expect(postModelMapper).toBeDefined();
  });

  describe('toFirestore', () => {
    it('should map Post to PostDbModel', () => {
      const post: Post = {
        id: '1',
        author: { id: 'user1' } as User,
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: [1, 2, 3],
        } as MultipleChoiceQuestion,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Post;
      (doc as jest.Mock).mockReturnValue({
        id: 'user1',
      });

      const postDbModel = postModelMapper.toFirestore(post);

      expect(postDbModel).toEqual({
        author: expect.any(Object),
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: { 0: 1, 1: 2, 2: 3 },
        },
        createdAt: expect.any(Timestamp),
        updatedAt: serverTimestamp(),
      });
    });

    it('should accept a FieldValue for author', () => {
      const post: WithFieldValue<Post> = {
        id: '1',
        author: deleteField(),
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: [1, 2, 3],
        } as MultipleChoiceQuestion,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WithFieldValue<Post>;

      const postDbModel = postModelMapper.toFirestore(post);

      expect(postDbModel).toEqual({
        author: deleteField(),
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: { 0: 1, 1: 2, 2: 3 },
        },
        createdAt: expect.any(Timestamp),
        updatedAt: serverTimestamp(),
      });
    });

    it('permit a FieldValue in the content field', () => {
      const post: WithFieldValue<Post> = {
        id: '1',
        content: deleteField(),
        author: { id: 'user1' } as User,
        caption: 'This is a post',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WithFieldValue<Post>;

      const postDbModel = postModelMapper.toFirestore(post);

      expect(postDbModel).toEqual({
        content: deleteField(),
        author: expect.any(Object),
        caption: 'This is a post',
        createdAt: expect.any(Timestamp),
        updatedAt: serverTimestamp(),
      });
    });

    it('should accept a FieldValue in the createdAt field', () => {
      const post: WithFieldValue<Post> = {
        id: '1',
        author: { id: 'user1' } as User,
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: [1, 2, 3],
        } as MultipleChoiceQuestion,
        createdAt: serverTimestamp(),
        updatedAt: new Date(),
      } as WithFieldValue<Post>;

      const postDbModel = postModelMapper.toFirestore(post);

      expect(postDbModel).toEqual({
        author: expect.any(Object),
        caption: 'This is a post',
        content: {
          type: PostContentType.MULTIPLE_CHOICE,
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          voteTotals: { 0: 1, 1: 2, 2: 3 },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });

  it('should map PostDbModel to Post', () => {
    const postDbModel: PostDbModel = {
      author: { id: 'user1' } as DocumentReference<User>,
      caption: 'This is a post',
      content: {
        type: PostContentType.MULTIPLE_CHOICE,
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        voteTotals: { 0: 1, 1: 2, 2: 3 },
      },
      createdAt: new Timestamp(1, 0),
      updatedAt: new Timestamp(1, 0),
    };

    const snapshot: QueryDocumentSnapshot<PostDbModel> = {
      id: '1',
      data: () => postDbModel,
    } as unknown as QueryDocumentSnapshot<PostDbModel>;

    const post = postModelMapper.fromFirestore(snapshot);

    expect(post).toEqual({
      id: '1',
      author: { id: 'user1' },
      caption: 'This is a post',
      content: {
        type: PostContentType.MULTIPLE_CHOICE,
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        voteTotals: [1, 2, 3],
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
