import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import {
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { prepareSchemaForFederation } from './index';

describe('prepareSchemaForFederation', () => {
  let schema: GraphQLSchema;

  beforeEach(() => {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'Hello world',
          },
        },
      }),
    });
  });

  it('should add stitching directives to the schema', () => {
    const transformer = prepareSchemaForFederation();
    const transformedSchema = transformer(schema);

    const { allStitchingDirectives } = stitchingDirectives();
    const stitchingDirectiveNames = allStitchingDirectives.map(
      (directive) => directive.name,
    );

    stitchingDirectiveNames.forEach((directiveName) => {
      expect(transformedSchema.getDirective(directiveName)).toBeDefined();
    });
  });

  it('should add enhanced introspection to the schema', () => {
    const transformer = prepareSchemaForFederation();
    const transformedSchema = transformer(schema);

    const queryType = transformedSchema.getQueryType();
    const serviceField = queryType?.getFields()['_service'];

    expect(serviceField).toBeDefined();
    expect(serviceField?.type.toString()).toBe('_Service');
  });

  it('should include additional transformers', () => {
    const additionalTransformer = jest.fn((schema: GraphQLSchema) => schema);
    const transformer = prepareSchemaForFederation(additionalTransformer);
    transformer(schema);

    expect(additionalTransformer).toHaveBeenCalled();
  });

  it('should correctly resolve _service field', () => {
    const transformer = prepareSchemaForFederation();
    const transformedSchema = transformer(schema);

    const queryType = transformedSchema.getQueryType();
    const serviceField = queryType?.getFields()['_service'];

    const resolveFn = serviceField?.resolve;
    const result = resolveFn
      ? resolveFn(
          undefined,
          undefined,
          undefined,
          undefined as unknown as GraphQLResolveInfo,
        )
      : null;

    expect(result).toEqual({
      _sdl: printSchemaWithDirectives(transformedSchema),
    });
  });
});
