/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  BuildSchemaOptions,
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { join } from 'path';
import { UsersResolver } from '../app/users/users.resolver';

const RESOLVERS: Function[] = [UsersResolver];
const SCALARS: Function[] = [];
const OPTIONS: BuildSchemaOptions = {};

/**
 * Generate schema.gql file
 */
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create(RESOLVERS, SCALARS, OPTIONS);

  const targetFolder = join(process.cwd(), 'generated');
  if (!existsSync(targetFolder)) {
    Logger.log(`Creating folder ${targetFolder}`);
    mkdirSync(targetFolder);
  }

  const targetFile = join(
    targetFolder,
    process.env.SCHEMA_FILE || 'schema.gql'
  );
  const schemaString = printSchema(schema);

  Logger.log(`Writing schema to ${targetFile}`);

  writeFileSync(targetFile, schemaString);
  Logger.log('Schema generated successfully.');
}

generateSchema();
