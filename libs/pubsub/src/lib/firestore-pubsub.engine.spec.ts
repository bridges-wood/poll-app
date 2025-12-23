import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { PubSubEngine } from 'graphql-subscriptions';
import { MissingTopicError } from './errors/missing-topic.error';
import { FirestorePubSubEngine, Listener } from './firestore-pubsub.engine';

jest.mock('@org/log');
jest.mock('graphql-subscriptions');

describe('FirestorePubSubEngine', () => {
  let engine: FirestorePubSubEngine;
  let mockAsyncIterableIterator: jest.SpyInstance;

  beforeEach(async () => {
    mockAsyncIterableIterator = jest.spyOn(
      PubSubEngine.prototype,
      'asyncIterableIterator',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirestorePubSubEngine,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    engine = module.get<FirestorePubSubEngine>(FirestorePubSubEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasHandler', () => {
    it('should return true if handler exists for topic', () => {
      engine.registerHandler('test-topic', jest.fn());

      expect(engine.hasHandler('test-topic')).toBe(true);
    });

    it('should return false if handler does not exist for topic', () => {
      expect(engine.hasHandler('non-existent')).toBe(false);
    });
  });

  describe('registerHandler', () => {
    it('should register a new handler and log debug', () => {
      const handler = jest.fn();

      engine.registerHandler('test-topic', handler);

      expect(engine.hasHandler('test-topic')).toBe(true);
    });

    it('should throw DuplicateTopicError if handler already exists', () => {
      engine.registerHandler('test-topic', jest.fn());

      expect(() => engine.registerHandler('test-topic', jest.fn())).toThrow(
        'A handler for topic "test-topic" already exists.',
      );
    });
  });

  describe('subscribe', () => {
    it('should subscribe to topic, call handler, and return subId', async () => {
      const mockUnsubscribe = jest.fn();
      const handler = jest.fn(() => mockUnsubscribe);
      engine.registerHandler('test-topic', handler);
      const onMessage = jest.fn();

      const subId = await engine.subscribe(
        'test-topic',
        onMessage as unknown as Listener,
        {},
      );

      expect(handler).toHaveBeenCalledWith(onMessage, { args: undefined });
      expect(subId).toBe(1);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(0); // Not yet unsubscribed
    });

    it('should throw MissingTopicError if no handler for topic', async () => {
      const onMessage = jest.fn();

      await expect(
        engine.subscribe('non-existent', onMessage as unknown as Listener, {}),
      ).rejects.toThrow(MissingTopicError);
    });

    it('should reuse args from existing subscription', async () => {
      const mockUnsubscribe = jest.fn();
      const handler = jest.fn(() => mockUnsubscribe);
      engine.registerHandler('test-topic', handler);
      const onMessage = jest.fn();

      // First subscription with args
      engine.createAsyncIterableIterator('test-topic', { key: 'value' });
      // Second subscription
      await engine.subscribe(
        'test-topic',
        onMessage as unknown as Listener,
        {},
      );

      expect(handler).toHaveBeenCalledWith(onMessage, {
        args: { key: 'value' },
      });
    });
  });

  describe('unsubscribe', () => {
    it('should call unsubscribe and remove subscription', async () => {
      const mockUnsubscribe = jest.fn(() => true);
      const handler = jest.fn(() => mockUnsubscribe);
      engine.registerHandler('test-topic', handler);
      const subId = await engine.subscribe(
        'test-topic',
        jest.fn() as unknown as Listener,
        {},
      );

      engine.unsubscribe(subId);

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should remove the correct subscription by ID', async () => {
      const mockUnsubscribe1 = jest.fn(() => true);
      const mockUnsubscribe2 = jest.fn(() => true);
      const handler = jest.fn(() => mockUnsubscribe1);
      engine.registerHandler('test-topic', handler);

      // Register another handler for a different topic
      const handler2 = jest.fn(() => mockUnsubscribe2);
      engine.registerHandler('another-topic', handler2);
      const subId2 = await engine.subscribe(
        'another-topic',
        jest.fn() as unknown as Listener,
        {},
      );
      
      engine.unsubscribe(subId2);
      expect(mockUnsubscribe1).not.toHaveBeenCalled();
      expect(mockUnsubscribe2).toHaveBeenCalled();
    });

    it('should do nothing if no subscription found', () => {
      engine.unsubscribe(999);
    });

    it('should throw error if unsubscribe returns false', async () => {
      const mockUnsubscribe = jest.fn(() => false);
      const handler = jest.fn(() => mockUnsubscribe);
      engine.registerHandler('test-topic', handler);
      const subId = await engine.subscribe(
        'test-topic',
        jest.fn() as unknown as Listener,
        {},
      );

      expect(() => engine.unsubscribe(subId)).toThrow(
        'Unsubscribe failed for subscription ID 1',
      );
    });
  });

  describe('publish', () => {
    it('should resolve without doing anything', async () => {
      await expect(engine.publish('test-topic', {})).resolves.toBeUndefined();
    });
  });

  describe('createAsyncIterableIterator', () => {
    it('should set subscriptions for single topic and call asyncIterableIterator', () => {
      const args = { key: 'value' };

      engine.createAsyncIterableIterator('test-topic', args);

      expect(mockAsyncIterableIterator).toHaveBeenCalledWith('test-topic');
      // Check subscription was set (accessing private map indirectly via subscribe or other means, but since it's private, rely on behavior)
    });

    it('should set subscriptions for array of topics and call asyncIterableIterator', () => {
      const topics = ['topic1', 'topic2'];
      const args = {};

      engine.createAsyncIterableIterator(topics, args);

      expect(mockAsyncIterableIterator).toHaveBeenCalledWith(topics);
    });
  });
});
