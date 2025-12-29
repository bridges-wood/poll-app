/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { BuildSchemaOptions, Query, Resolver } from '@nestjs/graphql';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { generateSchema, Transformer } from './generate-schema';

@Resolver()
class TestResolver {
  @Query(() => String)
  test() {
    return 'test';
  }
}

jest.mock('fs');

jest.mock('@graphql-tools/utils', () => ({
  ...jest.requireActual('@graphql-tools/utils'),
  printSchemaWithDirectives: jest.fn().mockReturnValue('schema-string'),
}));

describe('generateSchema', () => {
  const { allStitchingDirectives } = stitchingDirectives();
  const RESOLVERS: Function[] = [TestResolver];
  const SCALARS: Function[] = [];
  const options: BuildSchemaOptions = {
    directives: allStitchingDirectives,
  };

  beforeEach(() => {
    process.env['SCHEMA_FILE'] = 'schema.graphql';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate schema and write to file', async () => {
    await generateSchema(RESOLVERS, SCALARS, options);

    expect(existsSync).toHaveBeenCalledWith(
      expect.stringContaining('generated'),
    );
    expect(mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('generated'),
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('schema.graphql'),
      'schema-string',
    );
  });

  it('should not create a folder for the schema file if it already exists', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);

    await generateSchema(RESOLVERS, SCALARS, options);

    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it('should throw error if SCHEMA_FILE is not defined', async () => {
    delete process.env['SCHEMA_FILE'];

    await expect(generateSchema(RESOLVERS, SCALARS, options)).rejects.toThrow(
      'SCHEMA_FILE is not defined, cannot generate schema',
    );
  });

  it('should apply transformers to the schema', async () => {
    const mockTransformer: Transformer = jest.fn((schema) => schema);
    await generateSchema(RESOLVERS, SCALARS, options, [mockTransformer]);

    expect(mockTransformer).toHaveBeenCalled();
  });
});
