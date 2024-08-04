/* eslint-disable @typescript-eslint/ban-types */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { addTypes } from '@graphql-tools/utils';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { Transformer, generateSchema } from '@org/graphql/scripts';
import { GraphQLDirective } from 'graphql';
import { PostsResolver } from '../app/posts/posts.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [PostsResolver];
const SCALARS: Function[] = [];
const OPTIONS: BuildSchemaOptions = {
  directives: allStitchingDirectives,
};
const TRANSFORMERS: Transformer[] = [
  (schema) =>
    addTypes(schema, [
      new GraphQLDirective({
        name: 'oneOf',
        locations: ['INPUT_OBJECT', 'FIELD_DEFINITION'] as any[],
        args: {},
      }),
    ]),
];

generateSchema(RESOLVERS, SCALARS, OPTIONS, TRANSFORMERS);
