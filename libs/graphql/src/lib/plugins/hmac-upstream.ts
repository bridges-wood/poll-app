import { createHmac } from 'crypto';
import { GraphQLParams, Plugin, YogaLogger } from 'graphql-yoga';
import jsonStableStringify from 'json-stable-stringify';

export const HMAC_SIGNATURE_EXTENSION = 'hmac-signature';

type HmacUpstreamOptions = {
  secret: string;
};

export function computeHmacSignature(
  { query, variables }: Pick<GraphQLParams, 'query' | 'variables'>,
  key: string,
): string {
  return createHmac('sha256', key)
    .update(jsonStableStringify({ query, variables }))
    .digest('base64');
}

export function useHmacUpstreamSignature(options: HmacUpstreamOptions): Plugin {
  if (!options.secret)
    throw new Error(
      'Property "secret" is is required for useHmacUpstreamSignature plugin',
    );

  let logger: YogaLogger;

  return {
    onYogaInit({ yoga }) {
      logger = yoga.logger;
    },
    onParams({ params, setParams }) {
      logger.debug('Adding HMAC signature extension');

      setParams({
        ...params,
        extensions: {
          ...params.extensions,
          [HMAC_SIGNATURE_EXTENSION]: computeHmacSignature(
            params,
            options.secret,
          ),
        },
      });
    },
  };
}
