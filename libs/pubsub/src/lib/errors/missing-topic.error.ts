export class MissingTopicError extends Error {
  constructor(topic: string) {
    super(`No handler found for topic "${topic}".`);
    this.name = 'MissingTopicError';
  }
}
