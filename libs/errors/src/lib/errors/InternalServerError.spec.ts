import { InternalServerError } from './InternalServerError';

describe('InternalServerError', () => {
  it('should create an instance of InternalServerError', () => {
    const error = new InternalServerError('Internal server error');
    expect(error).toBeInstanceOf(InternalServerError);
  });

  it('should set the correct message', () => {
    const message = 'Internal server error';
    const error = new InternalServerError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new InternalServerError('Internal server error');
    expect(error.name).toBe('InternalServerError');
  });

  it('should have a stack trace', () => {
    const error = new InternalServerError('Internal server error');
    expect(error.stack).toBeDefined();
  });
});
