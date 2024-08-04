import { addResolversToSchema } from '@graphql-tools/schema';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import {
  addTypes,
  appendObjectFields,
  printSchemaWithDirectives,
} from '@graphql-tools/utils';
import { GraphQLSchema, GraphQLString } from 'graphql';
import { flow } from 'lodash';

const { stitchingDirectivesValidator, allStitchingDirectives } =
  stitchingDirectives();

type Transformer = (schema: GraphQLSchema) => GraphQLSchema;

const addStitchingDirectives: Transformer = (schema) => {
  return addTypes(schema, allStitchingDirectives);
};

const addSDLToQuery: Transformer = (schema) => {
  return appendObjectFields(schema, 'Query', {
    _sdl: {
      type: GraphQLString,
      description: 'Prints the SDL of the schema',
    },
  });
};

const addSDLResolver: Transformer = (schema) => {
  return addResolversToSchema({
    schema,
    resolvers: {
      Query: {
        _sdl: () => {
          return printSchemaWithDirectives(schema);
        },
      },
    },
  });
};

export const prepareSchemaForFederation = (
  ...additionalTransformers: Transformer[]
): Transformer => {
  return (schema) => {
    const transformers: Transformer[] = [
      ...additionalTransformers,
      addStitchingDirectives,
      addSDLToQuery,
      addSDLResolver,
      stitchingDirectivesValidator,
    ];

    return flow(transformers)(schema);
  };
};
