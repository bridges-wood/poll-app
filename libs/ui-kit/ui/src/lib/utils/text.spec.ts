import { safeText, safeAriaLabel } from './text';

describe('safeText', () => {
  it('should return the original text if length is 4 or less', () => {
    expect(safeText('test')).toBe('test');
    expect(safeText('')).toBe('');
    expect(safeText('abc')).toBe('abc');
  });

  it('should return the first 3 characters if length is more than 4', () => {
    expect(safeText('testing')).toBe('tes');
    expect(safeText('12345')).toBe('123');
  });
});

describe('safeAriaLabel', () => {
  it('should return the first non-empty string', () => {
    expect(safeAriaLabel('', 'label', 'another')).toBe('label');
    expect(safeAriaLabel('first', 'second')).toBe('first');
  });

  it('should return a single space if all inputs are empty or not strings', () => {
    expect(safeAriaLabel('', null, undefined, 123)).toBe(' ');
    expect(safeAriaLabel()).toBe(' ');
  });

  it('should handle mixed types and return the first non-empty string', () => {
    expect(safeAriaLabel(123, 'valid', '', null)).toBe('valid');
    expect(safeAriaLabel(false, 'another')).toBe('another');
  });
});