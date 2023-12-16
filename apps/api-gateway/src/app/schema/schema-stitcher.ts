import { SubschemaConfig, Transform } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { FilterTypes } from '@graphql-tools/wrap';
import { YogaDriver } from '@graphql-yoga/nestjs';
import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLSchema, buildSchema } from 'graphql';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { EndpointLoader } from '../endpoints/endpoint-loader';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';

@Injectable()
export class SchemaStitcher {
  private readonly logger = new Logger(SchemaStitcher.name);
  private localSchema$ = new BehaviorSubject<GraphQLSchema | undefined>(
    undefined
  );
  public stitchedSchema$ = new BehaviorSubject<GraphQLSchema | undefined>(
    undefined
  );
  private app: INestApplication;

  public applyApp(app: INestApplication) {
    this.app = app;
    this.checkServer();
  }

  constructor(private endpointLoader: EndpointLoader) {
    combineLatest([
      this.endpointLoader.loadedEndpoints$,
      this.localSchema$,
    ]).subscribe(async ([endpoints, localSchema]) => {
      const newSchema = await this.stitch(endpoints, localSchema);
      this.stitchedSchema$.next(newSchema);
    });
  }

  public async stitchWithRemotes(
    localSchema: GraphQLSchema
  ): Promise<GraphQLSchema> {
    this.localSchema$.next(localSchema);
    return await this.stitch(this.endpointLoader.getEndpoints(), localSchema);
  }

  private async stitch(
    endpoints: LoadedEndpoint[],
    localSchema?: GraphQLSchema
  ): Promise<GraphQLSchema> {
    if (endpoints.length === 0) {
      this.logger.warn('No endpoints to stitch, skipping');
      return localSchema;
    }

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

    if (localSchema) {
      subschemas.push({
        schema: localSchema,
      });
    }

    this.logger.log(`Stitching ${subschemas.length} subschema(s)`);

    return stitchSchemas({
      subschemaConfigTransforms: [stitchingDirectivesTransformer],
      subschemas,
    });
  }

  private checkServer() {
    const graphqlModule =
      this.app.get<GraphQLModule<YogaDriver>>(GraphQLModule);
    const adapter = graphqlModule.graphQlAdapter;
    // console.log('adapter', adapter)
  }

  private getTransforms(): Array<Transform> {
    return [new FilterTypes((namedType) => namedType.name !== 'DateTime')];
  }
}
