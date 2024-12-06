/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { generateSchema } from '@org/graphql/scripts';
import { UsersResolver } from '../app/users/users.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [UsersResolver];
const SCALARS: Function[] = [];
const OPTIONS: BuildSchemaOptions = {
  directives: allStitchingDirectives,
};

generateSchema(RESOLVERS, SCALARS, OPTIONS);
