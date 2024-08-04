/* eslint-disable @typescript-eslint/ban-types */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { generateSchema } from '@org/graphql/scripts';
import { AuthResolver } from '../app/auth/auth.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [AuthResolver];
const SCALARS: Function[] = [];
const options: BuildSchemaOptions = {
  directives: allStitchingDirectives,
};

generateSchema(RESOLVERS, SCALARS, options);
