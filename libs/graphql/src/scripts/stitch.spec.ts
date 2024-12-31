import { stitchSchemas } from '@graphql-tools/stitch';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildSchema, printSchema } from 'graphql';
import { when } from 'jest-when';
import { join } from 'path';
import { stitchGeneratedSchemas } from './stitch';

const realJoin = jest.requireActual('path').join;

jest.mock('fs');
jest.mock('path');
jest.mock('graphql');
jest.mock('@graphql-tools/stitch');
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(process, 'cwd').mockReturnValue('/test');

describe('stitchGeneratedSchemas', () => {
  const schemaFolder = realJoin(process.cwd(), 'generated');
  const schemaFile = realJoin(schemaFolder, 'schema.gql');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create schema file if it does not exist', () => {
    (readdirSync as jest.Mock).mockReturnValue([]);
    (join as jest.Mock).mockReturnValue(schemaFile);

    stitchGeneratedSchemas();

    expect(writeFileSync).toHaveBeenCalledWith(schemaFile, '');
  });

  it('should stitch schemas if schema file exists', () => {
    const mockSchemas = [
      'type Query { hello: String }',
      'type Mutation { sayHello: String }',
    ];
    (readdirSync as jest.Mock).mockReturnValue([
      'schema1.gql',
      'schema2.gql',
      'schema.gql',
    ]);
    (join as jest.Mock).mockImplementation(realJoin);
    when(readFileSync as jest.Mock)
      .calledWith(join(schemaFolder, 'schema1.gql'), 'utf8')
      .mockReturnValue(mockSchemas[0]);
    when(readFileSync as jest.Mock)
      .calledWith(join(schemaFolder, 'schema2.gql'), 'utf8')
      .mockReturnValue(mockSchemas[1]);

    (buildSchema as jest.Mock).mockImplementation((schema) => schema);
    (stitchSchemas as jest.Mock).mockReturnValue('stitchedSchema');
    (printSchema as jest.Mock).mockReturnValue('printedSchema');

    stitchGeneratedSchemas();

    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(stitchSchemas).toHaveBeenCalledWith({
      subschemas: [{ schema: mockSchemas[0] }, { schema: mockSchemas[1] }],
    });
    expect(writeFileSync).toHaveBeenCalledWith(schemaFile, 'printedSchema');
  });

  it('should log the correct number of schemas found', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    (readdirSync as jest.Mock).mockReturnValue([
      'schema1.gql',
      'schema2.gql',
      'schema.gql',
    ]);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    stitchGeneratedSchemas();

    expect(consoleSpy).toHaveBeenCalledWith('Schemas found:', 2);
    consoleSpy.mockRestore();
  });
});
