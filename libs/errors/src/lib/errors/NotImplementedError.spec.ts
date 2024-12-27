import { NotImplementedError } from './NotImplementedError';

describe('NotImplementedError', () => {
  it('should create an instance of NotImplementedError', () => {
    const error = new NotImplementedError('Not implemented');
    expect(error).toBeInstanceOf(NotImplementedError);
  });

  it('should set the correct message', () => {
    const message = 'Not implemented';
    const error = new NotImplementedError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new NotImplementedError('Not implemented');
    expect(error.name).toBe('NotImplementedError');
  });

  it('should have a stack trace', () => {
    const error = new NotImplementedError('Not implemented');
    expect(error.stack).toBeDefined();
  });
});
