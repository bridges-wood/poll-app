import { ConfigType, registerAs } from '@nestjs/config';
import { join } from 'path';
import { z } from 'zod';
import { ConfigTokens } from '../tokens';

export const schemaValidator = z.object({
  SCHEMA_FILE: z.string().optional(),
});

const SchemaConfigFactory = registerAs(ConfigTokens.SCHEMA, () => ({
  schemaFile: join(
    process.cwd(),
    `generated/${process.env['SCHEMA_FILE'] || 'schema.graphql'}`,
  ),
}));

export type SchemaConfig = ConfigType<typeof SchemaConfigFactory>;

export default SchemaConfigFactory;
