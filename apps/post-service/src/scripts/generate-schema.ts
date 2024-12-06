/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { addTypes } from '@graphql-tools/utils';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { Transformer, generateSchema } from '@org/graphql/scripts';
import { GraphQLDirective } from 'graphql';
import { PostsResolver } from '../app/posts/posts.resolver';
import { ResponsesResolver } from '../app/responses/responses.resolver';
import { UsersResolver } from '../app/users/users.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [PostsResolver, ResponsesResolver, UsersResolver];
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
