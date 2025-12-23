import { DuplicateTopicError } from './duplicate-topic.error';

describe('DuplicateTopicError', () => {
  it('should create an error with the correct message', () => {
    const topic = 'test-topic';
    const error = new DuplicateTopicError(topic);

    expect(error.message).toBe(
      `A handler for topic "${topic}" already exists.`,
    );
  });

  it('should have the correct error name', () => {
    const error = new DuplicateTopicError('my-topic');

    expect(error.name).toBe('DuplicateTopicError');
  });

  it('should be an instance of Error', () => {
    const error = new DuplicateTopicError('test');

    expect(error).toBeInstanceOf(Error);
  });

  it('should handle topics with special characters', () => {
    const topic = 'topic-with-special-chars!@#$';
    const error = new DuplicateTopicError(topic);

    expect(error.message).toBe(
      `A handler for topic "${topic}" already exists.`,
    );
  });
});
