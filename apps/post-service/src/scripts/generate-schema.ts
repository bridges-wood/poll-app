/* eslint-disable @typescript-eslint/ban-types */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { generateSchema } from '@org/graphql/scripts';
import { PostsResolver } from '../app/posts/posts.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [PostsResolver];
const SCALARS: Function[] = [];
const OPTIONS: BuildSchemaOptions = {
  directives: allStitchingDirectives,
};

generateSchema(RESOLVERS, SCALARS, OPTIONS);
