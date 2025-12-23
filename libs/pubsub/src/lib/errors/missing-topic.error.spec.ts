import { MissingTopicError } from './missing-topic.error';

describe('MissingTopicError', () => {
  it('should create an error with the correct message', () => {
    const topic = 'test-topic';
    const error = new MissingTopicError(topic);

    expect(error.message).toBe(`No handler found for topic "${topic}".`);
  });

  it('should have the correct error name', () => {
    const error = new MissingTopicError('my-topic');

    expect(error.name).toBe('MissingTopicError');
  });

  it('should be an instance of Error', () => {
    const error = new MissingTopicError('test');

    expect(error).toBeInstanceOf(Error);
  });

  it('should handle topics with special characters', () => {
    const topic = 'topic-with-special-chars!@#$';
    const error = new MissingTopicError(topic);

    expect(error.message).toBe(`No handler found for topic "${topic}".`);
  });
});
