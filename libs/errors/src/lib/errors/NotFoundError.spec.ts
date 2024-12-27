import { NotFoundError } from './NotFoundError';

describe('NotFoundError', () => {
  it('should create an instance of NotFoundError', () => {
    const error = new NotFoundError('Not found');
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('should set the correct message', () => {
    const message = 'Not found';
    const error = new NotFoundError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new NotFoundError('Not found');
    expect(error.name).toBe('NotFoundError');
  });

  it('should have a stack trace', () => {
    const error = new NotFoundError('Not found');
    expect(error.stack).toBeDefined();
  });
});
