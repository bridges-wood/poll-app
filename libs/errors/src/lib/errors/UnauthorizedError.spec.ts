import { UnauthorizedError } from './UnauthorizedError';

describe('NotFoundError', () => {
  it('should create an instance of NotFoundError', () => {
    const error = new UnauthorizedError('Not authorized');
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('should set the correct message', () => {
    const message = 'Not authorized';
    const error = new UnauthorizedError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new UnauthorizedError('Not authorized');
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should have a stack trace', () => {
    const error = new UnauthorizedError('Not authorized');
    expect(error.stack).toBeDefined();
  });
});
