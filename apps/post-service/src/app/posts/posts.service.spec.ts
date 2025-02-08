import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseModule } from '@org/firebase';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { PubSubModule } from '@org/pubsub';
import { PostContentType } from '@org/typings';
import { doc, runTransaction, updateDoc } from 'firebase/firestore';
import { User } from '../users/models/user.stub';
import { CreatePostArgs } from './models/create-post.args';
import { Post } from './models/post.model';
import { PostModelMapper } from './models/post.model-mapper';
import { UpdatePostArgs } from './models/update-post.args';
import { PostsService } from './posts.service';

jest.mock('firebase/auth');

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
}));

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot(),
        FirebaseModule.forFeature({
          providers: [PostModelMapper],
          entities: [Post],
        }),
        PubSubModule,
      ],
      providers: [
        PostsService,

        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    await module.init();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a post and return it', async () => {
      const args: CreatePostArgs = {
        content: {
          multipleChoiceQuestion: {
            question: 'test',
            options: ['a', 'b'],
            type: PostContentType.MULTIPLE_CHOICE,
          },
        },
        caption: 'test',
      };
      const author: Pick<User, 'id'> = { id: 'user-id' };
      const post = {
        id: 'post-id',
        caption: 'test',
        content: {
          question: 'test',
          options: ['a', 'b'],
          type: PostContentType.MULTIPLE_CHOICE,
          voteTotals: [0, 0],
        },
        author,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      };

      (doc as jest.Mock).mockReturnValue({
        id: 'post-id',
        set: jest.fn(),
      } as any);
      (runTransaction as jest.Mock).mockImplementation(async (_db, fn) =>
        fn({
          set: jest.fn(),
          update: jest.fn(),
        }),
      );

      expect(await service.createOne(args, author)).toEqual(post);
    });
  });

  describe('updateOne', () => {
    it('should update a post and return it', async () => {
      const id = 'test-id';
      const args: UpdatePostArgs = { caption: 'updated' };
      const post = { id, caption: 'test' } as any;

      jest.spyOn(service, 'findOneById').mockResolvedValue(post);
      (updateDoc as jest.Mock).mockResolvedValue(null);

      expect(await service.updateOne(id, args)).toEqual({ ...post, ...args });
    });
  });

  describe('deleteOne', () => {
    it('should delete a post and return true', async () => {
      const id = 'test-id';
      const post = { id, author: 'user-id' } as any;

      (doc as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: jest.fn().mockReturnValue(true),
          data: () => post,
        }),
        delete: jest.fn(),
      } as any);
      (runTransaction as jest.Mock).mockImplementation(async (_db, fn) =>
        fn({
          get: jest.fn().mockResolvedValue({
            exists: jest.fn().mockReturnValue(true),
            data: () => post,
          }),
          delete: jest.fn(),
          update: jest.fn(),
        }),
      );

      expect(await service.deleteOne(id)).toBe(true);
    });

    it('should return false if post not found', async () => {
      const id = 'test-id';

      (doc as jest.Mock).mockReturnValue({
        get: jest
          .fn()
          .mockResolvedValue({ exists: jest.fn().mockReturnValue(false) }),
      } as any);
      (runTransaction as jest.Mock).mockImplementation(async (_db, fn) =>
        fn({
          get: jest
            .fn()
            .mockResolvedValue({ exists: jest.fn().mockReturnValue(false) }),
        }),
      );

      expect(await service.deleteOne(id)).toBe(false);
    });
  });
});
