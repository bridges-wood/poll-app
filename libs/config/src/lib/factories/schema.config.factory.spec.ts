import { join } from 'path';
import schemaConfigFactory, { schemaValidator } from './schema.config.factory';

describe('schemaConfigFactory', () => {
  const environment = { ...process.env };

  it('should load the configuration', () => {
    const config = schemaConfigFactory();

    expect(config).toEqual({
      schemaFile: join(process.cwd(), `generated/test.graphql`),
    });
  });

  it('should default to schema.graphql if SCHEMA_FILE is not set', () => {
    delete process.env['SCHEMA_FILE'];
    const config = schemaConfigFactory();

    expect(config).toEqual({
      schemaFile: join(process.cwd(), `generated/schema.graphql`),
    });
  });

  afterEach(() => {
    process.env = environment;
  });
});

describe('schemaValidator', () => {
  it('should return complete config for valid input', () => {
    const result = schemaValidator.parse({
      SCHEMA_FILE: 'test.graphql',
    });

    expect(result).toEqual({
      SCHEMA_FILE: 'test.graphql',
    });
  });

  it('should return complete config for valid input with optional field', () => {
    const result = schemaValidator.parse({});

    expect(result).toEqual({});
  });
});
