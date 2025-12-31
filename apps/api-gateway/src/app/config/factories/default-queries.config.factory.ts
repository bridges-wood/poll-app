import { ConfigType, registerAs } from '@nestjs/config';
import { DefaultLogger } from '@org/log';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'graphql';
import { join } from 'path';
import { GatewayConfigTokens } from '../tokens';

const DefaultQueriesConfigFactory = registerAs(
  GatewayConfigTokens.DEFAULT_QUERIES,
  () => {
    const logger = new DefaultLogger();
    logger.setContext('DefaultQueriesConfigFactory');

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

    logger.debug(`Loaded ${queries.length} default queries from ${path}`);
    return { queries };
  },
);

export type DefaultQueriesConfig = ConfigType<
  typeof DefaultQueriesConfigFactory
>;

export default DefaultQueriesConfigFactory;
