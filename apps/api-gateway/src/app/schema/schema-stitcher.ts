import { SubschemaConfig, Transform } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { ExecutionRequest } from '@graphql-tools/utils';
import { FilterRootFields } from '@graphql-tools/wrap';
import { Injectable, Logger } from '@nestjs/common';
import { GraphQLSchema, buildSchema } from 'graphql';
import { isNil, pick } from 'lodash';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  filter,
  firstValueFrom,
  skip,
} from 'rxjs';
import { EndpointLoader } from '../endpoints/loaders';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class SchemaStitcher {
  private readonly logger = new Logger(SchemaStitcher.name);
  private localSchema$ = new Subject<GraphQLSchema>();
  public stitchedSchema$ = new BehaviorSubject<GraphQLSchema>(
    undefined as unknown as GraphQLSchema,
  );

  constructor(private endpointLoader: EndpointLoader) {
    combineLatest([this.endpointLoader.loadedEndpoints$, this.localSchema$])
      .pipe(filter(([_endpoints, localSchema]) => !isNil(localSchema)))
      .subscribe(async ([endpoints, localSchema]) => {
        const newSchema = await this.stitch(endpoints, localSchema);
        this.stitchedSchema$.next(newSchema);
      });
  }

  public async stitchWithRemotes(
    localSchema: GraphQLSchema,
  ): Promise<GraphQLSchema> {
    this.localSchema$.next(localSchema);
    return firstValueFrom(
      this.stitchedSchema$.pipe(skip(1)),
    ) as Promise<GraphQLSchema>; // Don't return initial undefined
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
    this.logger.log(
      `🪡  Successfully stitched ${subschemas.length} subschema(s) into complete schema`,
    );

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
        headers: ({ context }: ExecutionRequest) =>
          pick(context?.request?.headers?.headersInit, ['authorization']),
        // TODO make this function pure and configurable
        // TODO create trust mechanism for headers - don't trust the client, but trust the gateway
        // TODO setup HMAC for 
      }),
      batch: true,
      transforms: [
        new FilterRootFields(
          (_operation, rootFieldName, _fieldConfig) =>
            !rootFieldName.startsWith('_'),
        ) as Transform,
      ],
    };
  }
}
