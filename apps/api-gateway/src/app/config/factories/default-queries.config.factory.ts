import { ConfigType, registerAs } from '@nestjs/config';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'graphql';
import { join } from 'path';
import { GatewayConfigTokens } from '../tokens';

const DefaultQueriesFactory = registerAs(
  GatewayConfigTokens.DEFAULT_QUERIES,
  () => {
    const path = join(__dirname, 'assets/gql');
    const files = readdirSync(path).filter(
      (file) => file.endsWith('.gql') || file.endsWith('.graphql'),
    );
    const queries: string[] = [];

    for (const file of files) {
      const content = readFileSync(join(path, file), 'utf8');
      // Check if the file is a valid query
      parse(content);

      queries.push(content);
    }

    return { queries };
  },
);

export type DefaultQueriesConfig = ConfigType<typeof DefaultQueriesFactory>;

export default DefaultQueriesFactory;
