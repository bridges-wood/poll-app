import { dataAttr } from './functions';

describe('dataAttr', () => {
  it('should return "true" when condition is true', () => {
    expect(dataAttr(true)).toBe('true');
  });

  it('should return undefined when condition is false', () => {
    expect(dataAttr(false)).toBeUndefined();
  });

  it('should return undefined when condition is undefined', () => {
    expect(dataAttr(undefined)).toBeUndefined();
  });
});