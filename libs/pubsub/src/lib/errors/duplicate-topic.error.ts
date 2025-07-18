export class DuplicateTopicError extends Error {
  constructor(topic: string) {
    super(`A handler for topic "${topic}" already exists.`);
    this.name = 'DuplicateTopicError';
  }
}
