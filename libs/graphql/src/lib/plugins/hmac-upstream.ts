import assert from 'assert';
import { createHmac } from 'crypto';
import { GraphQLParams } from 'graphql-yoga';
import jsonStableStringify from 'json-stable-stringify';

export const HMAC_SIGNATURE_EXTENSION = 'hmac-signature';

export function serializeParams(params: GraphQLParams): string {
  const stringified = jsonStableStringify({
    query: params.query,
    variables: params.variables,
    extensions: {
      ...params.extensions,
      [HMAC_SIGNATURE_EXTENSION]: undefined,
    },
  });
  assert(typeof stringified === 'string', 'Params could not be stringified');
  return stringified;
}

export function computeHmacSignature(
  params: GraphQLParams,
  key: string,
): string {
  return createHmac('sha256', key)
    .update(serializeParams(params))
    .digest('base64');
}
