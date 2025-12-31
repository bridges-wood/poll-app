import { Kind, ValueNode } from 'graphql';
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
});
