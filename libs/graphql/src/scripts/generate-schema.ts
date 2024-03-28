/* eslint-disable @typescript-eslint/ban-types */
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  BuildSchemaOptions,
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate GraphQL schema file from resolvers and scalars
 */
export async function generateSchema(
  resolvers: Function[],
  scalars: Function[],
  options: BuildSchemaOptions,
) {
  if (!process.env.SCHEMA_FILE) {
    throw new Error('SCHEMA_FILE is not defined, cannot generate schema');
  }

  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create(resolvers, scalars, options);

  const targetFolder = join(process.cwd(), 'generated');
  if (!existsSync(targetFolder)) {
    Logger.log(`Creating folder ${targetFolder}`);
    mkdirSync(targetFolder);
  }

  const targetFile = join(targetFolder, process.env.SCHEMA_FILE);
  const schemaString = printSchemaWithDirectives(schema);

  Logger.log(`Writing schema to ${targetFile}`);

  writeFileSync(targetFile, schemaString);
  Logger.log('Schema generated successfully.');
}
