import { SubschemaConfig, Transform } from '@graphql-tools/delegate';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { FilterRootFields } from '@graphql-tools/wrap';
import { Injectable } from '@nestjs/common';
import { BaseLogger } from '@org/log';
import { GraphQLSchema, buildSchema } from 'graphql';
import { isNil } from 'lodash';
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
import { ExecutorFactory } from '../executors/executor-factory';

@Injectable()
export class SchemaStitcher {
  private localSchema$ = new Subject<GraphQLSchema>();
  public stitchedSchema$ = new BehaviorSubject<GraphQLSchema>(
    null as unknown as GraphQLSchema,
  );

  constructor(
    private endpointLoader: EndpointLoader,
    private readonly executorFactory: ExecutorFactory,
    protected readonly logger: BaseLogger,
  ) {
    this.logger.setContext(SchemaStitcher.name);
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
    return firstValueFrom(this.stitchedSchema$.pipe(skip(1))); // Don't return initial null value
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
      ...endpoints.map((endpoint) =>
        this.convertRemoteSchemaToSubschemaConfig.bind(this)(endpoint),
      ),
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

  private convertRemoteSchemaToSubschemaConfig(
    endpoint: LoadedEndpoint,
  ): SubschemaConfig {
    return {
      schema: buildSchema(endpoint.sdl),
      executor: this.executorFactory.getExecutor(endpoint.url),
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
