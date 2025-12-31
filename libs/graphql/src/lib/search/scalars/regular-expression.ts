import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

export const RegularExpressionScalar = new GraphQLScalarType({
  name: 'RegExp',
  description:
    '[Regular Expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) scalar type for filtering string fields using patterns.',
  serialize(value: unknown): string {
    if (value instanceof RegExp) {
      return value.source;
    }
    throw new Error(`${this.name} can only serialize RegExp values`);
  },
  parseValue(value: unknown): RegExp {
    if (typeof value === 'string') {
      return new RegExp(value);
    }
    throw new Error(`${this.name} can only parse string values`);
  },
  parseLiteral(ast: ValueNode): RegExp {
    if (ast.kind === Kind.STRING) {
      return new RegExp(ast.value);
    }
    throw new Error(`${this.name} can only parse string values`);
  },
});
