import { SubschemaConfig, Transform } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { FilterTypes } from '@graphql-tools/wrap';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLSchema, buildSchema } from 'graphql';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class SchemaStitcher {
  private readonly logger = new Logger(SchemaStitcher.name);

  public async stitch(endpoints: LoadedEndpoint[]): Promise<GraphQLSchema> {
    const { stitchingDirectivesTransformer } = stitchingDirectives();
    const subschemas: SubschemaConfig[] = endpoints.map(({ sdl, url }) => ({
      schema: buildSchema(sdl),
      executor: buildHTTPExecutor({
        endpoint: url,
        fetch,
      }),
      batch: true,
      transforms: this.getTransforms(),
    }));

    this.logger.log(`Stitching ${subschemas.length} subschema(s)`);

    return stitchSchemas({
      subschemaConfigTransforms: [stitchingDirectivesTransformer],
      subschemas,
    });
  }

  private getTransforms(): Array<Transform> {
    return [new FilterTypes((namedType) => namedType.name !== 'DateTime')];
  }
}
