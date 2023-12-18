import { SubschemaConfig } from '@graphql-tools/delegate';
import { stitchSchemas } from '@graphql-tools/stitch';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { buildSchema, printSchema } from 'graphql';
import { join } from 'path';

/**
 * Stitches together all the generated schemas into a single schema.
 */
const stitchGeneratedSchemas = () => {
  const schemaFolder = join(process.cwd(), 'generated');
  const schemaFile = join(schemaFolder, 'schema.gql');
  // Check if schema file exists.
  if (!readdirSync(schemaFolder).includes('schema.gql')) {
    console.log('No schema file found. Creating one...');
    writeFileSync(schemaFile, '');
  } else {
    console.log('Schema file found. Stitching schemas...');
  }

  const rawSchemas: string[] = [];

  readdirSync(schemaFolder).forEach((file) => {
    if (file === 'schema.gql') return;
    const schema = readFileSync(join(schemaFolder, file), 'utf8');
    rawSchemas.push(schema);
  });

  console.log('Schemas found:', rawSchemas.length);
  const parsedSchemas: SubschemaConfig[] = rawSchemas.map((schema) => ({
    schema: buildSchema(schema),
  }));

  const stitchedSchema = stitchSchemas({
    subschemas: parsedSchemas,
  });
  console.log('Successfully stitched schemas. Writing to file...');

  // Write the stitched schema to the target file.
  writeFileSync(schemaFile, printSchema(stitchedSchema));
  console.log('Successfully written to file.');
};

stitchGeneratedSchemas();
