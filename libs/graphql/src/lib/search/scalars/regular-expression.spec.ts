import { Kind, ValueNode } from 'graphql';
import { MAX_REGEX_PATTERN_LENGTH } from './regex-policy';
import { RegularExpressionScalar } from './regular-expression';

describe('RegularExpressionScalar', () => {
  it('should serialize RegExp to string', () => {
    const regex = /test/i;
    const result = RegularExpressionScalar.serialize(regex);
    expect(result).toBe('test');
  });

  it('should parse string to RegExp', () => {
    const str = 'test';
    const result = RegularExpressionScalar.parseValue(str);
    expect(result).toEqual(new RegExp(str));
  });

  it('should parse slash-delimited regex with allowed flags', () => {
    const result = RegularExpressionScalar.parseValue('/test/im');
    expect(result).toEqual(new RegExp('test', 'im'));
  });

  it('should parse literal to RegExp', () => {
    const ast: ValueNode = {
      kind: Kind.STRING,
      value: 'test',
    };
    const result = RegularExpressionScalar.parseLiteral(ast, {});
    expect(result).toEqual(new RegExp('test'));
  });

  it('should throw error when serializing non-RegExp', () => {
    expect(() => RegularExpressionScalar.serialize('not a regex')).toThrow(
      'RegExp can only serialize RegExp values',
    );
  });

  it('should throw error when parsing non-string value', () => {
    expect(() => RegularExpressionScalar.parseValue(123)).toThrow(
      'RegExp can only parse string values',
    );
  });

  it('should throw error when parsing non-string literal', () => {
    const ast: ValueNode = {
      kind: Kind.INT,
      value: '123',
    };
    expect(() => RegularExpressionScalar.parseLiteral(ast, {})).toThrow(
      'RegExp can only parse string values',
    );
  });

  it('should throw error when parsing unsafe regex pattern', () => {
    expect(() => RegularExpressionScalar.parseValue('(a+)+$')).toThrow(
      'RegExp pattern is unsafe',
    );
  });

  it('should throw error when parsing regex pattern longer than allowed', () => {
    const longPattern = 'a'.repeat(MAX_REGEX_PATTERN_LENGTH + 1);

    expect(() => RegularExpressionScalar.parseValue(longPattern)).toThrow(
      `RegExp pattern must be at most ${MAX_REGEX_PATTERN_LENGTH} characters`,
    );
  });

  it('should throw error for unsafe regex literal pattern', () => {
    const ast: ValueNode = {
      kind: Kind.STRING,
      value: '(a+)+$',
    };

    expect(() => RegularExpressionScalar.parseLiteral(ast, {})).toThrow(
      'RegExp pattern is unsafe',
    );
  });

  it('should throw error for disallowed regex flags', () => {
    expect(() => RegularExpressionScalar.parseValue('/test/g')).toThrow(
      'RegExp flags may only include: i, m, s',
    );
  });

  it('should throw error for duplicate regex flags', () => {
    expect(() => RegularExpressionScalar.parseValue('/test/ii')).toThrow(
      'RegExp flags must not contain duplicates',
    );
  });

  it('should throw error for disallowed regex flags in literal', () => {
    const ast: ValueNode = {
      kind: Kind.STRING,
      value: '/test/gy',
    };

    expect(() => RegularExpressionScalar.parseLiteral(ast, {})).toThrow(
      'RegExp flags may only include: i, m, s',
    );
  });
});
