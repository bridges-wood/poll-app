import { SubschemaConfig } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { FilterRootFields } from '@graphql-tools/wrap';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLSchema, buildSchema } from 'graphql';
import _ from 'lodash';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  filter,
  firstValueFrom,
  skip,
} from 'rxjs';
import { EndpointLoader } from '../endpoints/endpoint-loader';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class SchemaStitcher {
  private readonly logger = new Logger(SchemaStitcher.name);
  private localSchema$ = new Subject<GraphQLSchema>();
  public stitchedSchema$ = new BehaviorSubject<GraphQLSchema>(undefined);

  constructor(private endpointLoader: EndpointLoader) {
    combineLatest([this.endpointLoader.loadedEndpoints$, this.localSchema$])
      .pipe(
        filter(
          ([endpoints, localSchema]) =>
            endpoints.length > 0 && !_.isNil(localSchema),
        ),
      )
      .subscribe(async ([endpoints, localSchema]) => {
        const newSchema = await this.stitch(endpoints, localSchema);
        this.stitchedSchema$.next(newSchema);
      });
  }

  public async stitchWithRemotes(
    localSchema: GraphQLSchema,
  ): Promise<GraphQLSchema> {
    this.localSchema$.next(localSchema);
    return firstValueFrom(this.stitchedSchema$.pipe(skip(1))); // Don't return initial undefined
  }

  private async stitch(
    endpoints: LoadedEndpoint[],
    localSchema: GraphQLSchema,
  ): Promise<GraphQLSchema> {
    if (endpoints.length === 0) {
      this.logger.warn('No endpoints to stitch, skipping');
      return localSchema;
    }

    const { stitchingDirectivesTransformer } = stitchingDirectives();
    const subschemas: SubschemaConfig[] = [
      ...endpoints.map(this.convertRemoteSchemaToSubschemaConfig),
      {
        schema: localSchema,
      },
    ];

    this.logger.log(`🪡  Stitching ${subschemas.length} subschema(s)`);
    const stitchedSchema = stitchSchemas({
      subschemaConfigTransforms: [stitchingDirectivesTransformer],
      subschemas,
    });
    this.logger.log('🪡  Successfully stitched subschemas');

    return stitchedSchema;
  }

  private convertRemoteSchemaToSubschemaConfig({
    url,
    sdl,
  }: LoadedEndpoint): SubschemaConfig {
    return {
      schema: buildSchema(sdl),
      executor: buildHTTPExecutor({
        endpoint: url,
        fetch,
        headers: ({ context }) =>
          _.pick(context?.request?.headers?.headersInit, ['authorization']),
        // TODO make this function pure and configurable
        // TODO create trust mechanism for headers - don't trust the client, but trust the gateway
      }),
      batch: true,
      transforms: [
        new FilterRootFields(
          (_operation, rootFieldName, _fieldConfig) =>
            !rootFieldName.startsWith('_'),
        ),
      ],
    };
  }
}
