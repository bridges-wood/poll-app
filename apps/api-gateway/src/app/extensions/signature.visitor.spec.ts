import { Test, TestingModule } from '@nestjs/testing';
import HmacConfigFactory, { HmacConfig } from '@org/config/hmac.config.factory';
import {
  computeHmacSignature,
  HMAC_SIGNATURE_EXTENSION,
} from '@org/graphql/plugins';
import { parse, print } from 'graphql';
import { SignatureVisitor } from './signature.visitor';

jest.mock('@org/graphql/plugins');

describe('SignatureVisitor', () => {
  let visitor: SignatureVisitor;
  let hmacConfig: HmacConfig;
  const mockSecret = 'test-secret-key';

  beforeEach(async () => {
    hmacConfig = { secret: mockSecret };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureVisitor,
        {
          provide: HmacConfigFactory.KEY,
          useValue: hmacConfig,
        },
      ],
    }).compile();

    visitor = module.get<SignatureVisitor>(SignatureVisitor);
  });

  describe('visit', () => {
    it('should add HMAC signature to extensions', () => {
      const document = parse('query { test }');
      const variables = { id: '123' };
      const extensions = { tracing: {} };
      const mockSignature = 'mocked-signature';

      (computeHmacSignature as jest.Mock).mockReturnValue(mockSignature);

      const result = visitor.visit(extensions, { document, variables });

      expect(result).toEqual({
        ...extensions,
        [HMAC_SIGNATURE_EXTENSION]: mockSignature,
      });
    });

    it('should compute signature with correct parameters', () => {
      const document = parse('query { user { id name } }');
      const variables = { userId: '456' };
      const extensions = {};

      visitor.visit(extensions, { document, variables });

      expect(computeHmacSignature).toHaveBeenCalledWith(
        {
          query: print(document),
          variables,
          extensions,
        },
        mockSecret,
      );
    });

    it('should preserve existing extensions', () => {
      const document = parse('query { test }');
      const variables = null;
      const extensions = { custom: 'value', tracing: { version: 1 } };

      (computeHmacSignature as jest.Mock).mockReturnValue('sig');

      const result = visitor.visit(extensions, { document, variables }) ?? {};

      expect(result.custom).toBe('value');
      expect(result.tracing).toEqual({ version: 1 });
    });

    it('should handle empty extensions', () => {
      const document = parse('query { test }');
      const extensions = {};

      (computeHmacSignature as jest.Mock).mockReturnValue('sig');

      const result = visitor.visit(extensions, {
        document,
        variables: undefined,
      });

      expect(result).toHaveProperty(HMAC_SIGNATURE_EXTENSION);
    });

    it('should handle complex queries', () => {
      const document = parse(`
      mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
          id
          email
        }
      }
    `);
      const variables = { input: { name: 'John', email: 'john@example.com' } };
      const extensions = {};

      visitor.visit(extensions, { document, variables });

      expect(computeHmacSignature).toHaveBeenCalled();
      const callArgs = (computeHmacSignature as jest.Mock).mock.calls[0];
      expect(callArgs[0].variables).toEqual(variables);
      expect(callArgs[1]).toBe(mockSecret);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
