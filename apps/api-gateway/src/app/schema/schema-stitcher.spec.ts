import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { buildSchema } from 'graphql';
import { of } from 'rxjs';
import { EndpointLoader } from '../endpoints/loaders';
import { LoadedEndpoint } from '../endpoints/models/loaded-endpoint.model';
import { ExecutorFactory } from '../executors/executor-factory';
import { SchemaStitcher } from './schema-stitcher';

describe('SchemaStitcher', () => {
  let schemaStitcher: SchemaStitcher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaStitcher,
        {
          provide: EndpointLoader,
          useValue: {
            loadedEndpoints$: of([]),
          },
        },
        {
          provide: ExecutorFactory,
          useValue: {
            getExecutor: jest.fn(),
          },
        },
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    schemaStitcher = module.get<SchemaStitcher>(SchemaStitcher);
  });

  it('should be defined', () => {
    expect(schemaStitcher).toBeDefined();
  });

  it('should stitch schemas with remotes', async () => {
    const localSchema = buildSchema(`
      type Query {
        hello: String
      }
    `);

    const stitchedSchema = await schemaStitcher.stitchWithRemotes(localSchema);
    expect(stitchedSchema).toBeDefined();
    expect(stitchedSchema.getQueryType()?.getFields()).toHaveProperty('hello');
  });

  it('should remove root fields from remote schemas that begin with an underscore', async () => {
    const localSchema = buildSchema(`
      type Query {
        _hello: String
      }
    `);

    const endpoint: LoadedEndpoint = {
      url: 'http://example.com/graphql',
      sdl: `
        type Query {
          _remoteHello: String
        }
      `,
    } as LoadedEndpoint;

    const stitchedSchema = await schemaStitcher['stitch'](
      [endpoint],
      localSchema,
    );
    expect(stitchedSchema.getQueryType()?.getFields()).toHaveProperty('_hello');
    expect(stitchedSchema.getQueryType()?.getFields()).not.toHaveProperty(
      '_remoteHello',
    );
  });

  it('should log a warning if no endpoints to stitch', async () => {
    const localSchema = buildSchema(`
      type Query {
        hello: String
      }
    `);

    const loggerSpy = jest.spyOn(schemaStitcher['logger'], 'warn');
    await schemaStitcher['stitch']([], localSchema);
    expect(loggerSpy).toHaveBeenCalled();
  });

  it('should convert remote schema to subschema config', () => {
    const endpoint: LoadedEndpoint = {
      url: 'http://example.com/graphql',
      sdl: `
        type Query {
          remoteHello: String
        }
      `,
    } as LoadedEndpoint;

    const subschemaConfig =
      schemaStitcher['convertRemoteSchemaToSubschemaConfig'](endpoint);
    expect(subschemaConfig).toBeDefined();
    expect(subschemaConfig.schema.getQueryType()?.getFields()).toHaveProperty(
      'remoteHello',
    );
  });

  // TODO complete coverage of stitch
});
