import { addResolversToSchema } from '@graphql-tools/schema';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import {
  addTypes,
  appendObjectFields,
  printSchemaWithDirectives,
} from '@graphql-tools/utils';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { flow } from 'lodash';

const { stitchingDirectivesValidator, allStitchingDirectives } =
  stitchingDirectives();

type Transformer = (schema: GraphQLSchema) => GraphQLSchema;

function addStitchingDirectives(schema: GraphQLSchema) {
  return addTypes(schema, allStitchingDirectives);
}

function addEnhancedIntrospection(): Transformer[] {
  type Service = {
    _sdl: string;
  };

  const serviceObjectType = new GraphQLObjectType<Service>({
    name: '_Service',
    fields: {
      _sdl: {
        description: "A string representation of the subgraph's schema",
        type: GraphQLString,
      },
    },
  });

  return [
    (schema: GraphQLSchema) => addTypes(schema, [serviceObjectType]),
    (schema: GraphQLSchema) =>
      appendObjectFields(schema, 'Query', {
        _service: {
          type: serviceObjectType,
          description: 'The subgraph schema',
        },
      }),
    (schema: GraphQLSchema) =>
      addResolversToSchema({
        schema,
        resolvers: {
          Query: {
            _service: () => ({
              _sdl: printSchemaWithDirectives(schema),
            }),
          },
        },
      }),
  ];
}

export function prepareSchemaForFederation(
  ...additionalTransformers: Transformer[]
): Transformer {
  return (schema) => {
    const transformers: Transformer[] = [
      ...additionalTransformers,
      addStitchingDirectives,
      ...addEnhancedIntrospection(),
      stitchingDirectivesValidator,
    ];

    return flow(transformers)(schema);
  };
}
