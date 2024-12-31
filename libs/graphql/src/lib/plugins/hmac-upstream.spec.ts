import { GraphQLParams } from 'graphql-yoga';
import jsonStableStringify from 'json-stable-stringify';
import {
  computeHmacSignature,
  HMAC_SIGNATURE_EXTENSION,
  serializeParams,
} from './hmac-upstream';

jest.mock('json-stable-stringify');
const actualJsonStableStringify = jest.requireActual('json-stable-stringify');

describe('HMAC Upstream Plugin', () => {
  beforeEach(() => {
    (jsonStableStringify as jest.Mock).mockImplementation((args) =>
      actualJsonStableStringify(args),
    );
  });

  const params: GraphQLParams = {
    query: '{ testQuery }',
    variables: { testVar: 'testValue' },
    extensions: { [HMAC_SIGNATURE_EXTENSION]: 'testExtension' },
  };
  const key = 'testKey';

  describe('serializeParams', () => {
    it('should serialize GraphQLParams correctly', () => {
      const serialized = serializeParams(params);
      expect(serialized).toBe(
        '{"extensions":{},"query":"{ testQuery }","variables":{"testVar":"testValue"}}',
      );
    });

    it('should throw an error if params cannot be stringified', () => {
      (jsonStableStringify as jest.Mock).mockReturnValueOnce(undefined);
      const invalidParams = {
        ...params,
        query: () => {
          return 'testQuery';
        },
      } as unknown as GraphQLParams;
      expect(() => serializeParams(invalidParams)).toThrow(
        'Params could not be stringified',
      );
    });
  });

  describe('computeHmacSignature', () => {
    it('should compute HMAC signature correctly', () => {
      const signature = computeHmacSignature(params, key);
      expect(signature).toBe('BQzTVZfjGR/nbzqRFRqy/oOFKbYshmCQfoxXPiHkDG0=');
    });

    it('should return different signatures for different keys', () => {
      const differentKey = 'differentKey';
      const signature1 = computeHmacSignature(params, key);
      const signature2 = computeHmacSignature(params, differentKey);
      expect(signature1).not.toBe(signature2);
    });

    it('should return different signatures for different params', () => {
      const differentParams = {
        ...params,
        query: '{ differentQuery }',
      };
      const signature1 = computeHmacSignature(params, key);
      const signature2 = computeHmacSignature(differentParams, key);
      expect(signature1).not.toBe(signature2);
    });
  });
});
