import { BadRequestError } from './BadRequestError';

describe('BadRequestError', () => {
  it('should create an instance of BadRequestError', () => {
    const error = new BadRequestError('Bad request');
    expect(error).toBeInstanceOf(BadRequestError);
  });

  it('should set the correct message', () => {
    const message = 'Bad request';
    const error = new BadRequestError(message);
    expect(error.message).toBe(message);
  });

  it('should set the correct name', () => {
    const error = new BadRequestError('Bad request');
    expect(error.name).toBe('BadRequestError');
  });

  it('should have a stack trace', () => {
    const error = new BadRequestError('Bad request');
    expect(error.stack).toBeDefined();
  });
});
