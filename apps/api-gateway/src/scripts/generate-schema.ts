/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { BuildSchemaOptions } from '@nestjs/graphql';
import { generateSchema } from '@org/graphql/scripts';
import { EndpointsResolver } from '../app/endpoints/endpoints.resolver';

const { allStitchingDirectives } = stitchingDirectives();

const RESOLVERS: Function[] = [EndpointsResolver];
const SCALARS: Function[] = [];
const OPTIONS: BuildSchemaOptions = {
  directives: allStitchingDirectives,
};

generateSchema(RESOLVERS, SCALARS, OPTIONS);
