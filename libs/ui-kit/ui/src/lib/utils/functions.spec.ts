import { dataAttr, objectToDeps } from './functions';

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

describe('objectToDeps', () => {
  it('should return JSON string when object is valid', () => {
    const obj = { key: 'value' };
    expect(objectToDeps(obj)).toBe(JSON.stringify(obj));
  });

  it('should return empty string when object is undefined', () => {
    expect(objectToDeps(undefined)).toBe('');
  });

  it('should return empty string when object is not an object', () => {
    expect(objectToDeps('string' as never)).toBe('');
  });

  it('should return empty string when object cannot be stringified', () => {
    const obj: Record<string, unknown> = { key: 'value' };
    obj['self'] = obj; // Circular reference
    expect(objectToDeps(obj)).toBe('');
  });
});
