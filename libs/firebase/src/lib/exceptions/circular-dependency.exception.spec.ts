import { CircularDependencyException } from './circular-dependency.exception';

describe('CircularDependencyException', () => {
  it('should create an instance without context', () => {
    const exception = new CircularDependencyException();
    expect(exception).toBeInstanceOf(CircularDependencyException);
    expect(exception.message).toBe(
      'A circular dependency has been detected. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.'
    );
  });

  it('should create an instance with context', () => {
    const context = 'TestContext';
    const exception = new CircularDependencyException(context);
    expect(exception).toBeInstanceOf(CircularDependencyException);
    expect(exception.message).toBe(
      `A circular dependency has been detected inside ${context}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.`
    );
  });
});