import { ForbiddenError } from './ForbiddenError';

describe('ForbiddenError', () => {
  it('should create an instance of ForbiddenError', () => {
    const error = new ForbiddenError('Access denied');
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it('should set the correct message', () => {
    const message = 'Access denied';
    const error = new ForbiddenError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new ForbiddenError('Access denied');
    expect(error.name).toBe('ForbiddenError');
  });

  it('should have a stack trace', () => {
    const error = new ForbiddenError('Access denied');
    expect(error.stack).toBeDefined();
  });
});
