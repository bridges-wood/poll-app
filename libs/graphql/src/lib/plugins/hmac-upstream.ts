import { ExecutionRequest } from '@graphql-tools/utils';
import { createHmac } from 'crypto';
import { parse } from 'graphql';
import { GraphQLParams } from 'graphql-yoga';
import jsonStableStringify from 'json-stable-stringify';

export const HMAC_SIGNATURE_EXTENSION = 'hmac-signature';

export function computeHmacSignature(
  { query, variables }: Pick<GraphQLParams, 'query' | 'variables'>,
  key: string,
): string {
  return createHmac('sha256', key)
    .update(jsonStableStringify({ query, variables }))
    .digest('base64');
}

export function buildHmacSignedExecutionRequest(
  {
    query,
    variables,
  }: Pick<Required<GraphQLParams>, 'query'> & Pick<GraphQLParams, 'variables'>,
  key: string,
): ExecutionRequest {
  const signature = computeHmacSignature({ query, variables }, key);
  return {
    document: parse(query),
    variables,
    extensions: {
      [HMAC_SIGNATURE_EXTENSION]: signature,
    },
  };
}
