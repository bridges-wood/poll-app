import { AuthVisitor } from './auth.visitor';

describe('AuthVisitor', () => {
  let authVisitor: AuthVisitor;

  beforeEach(() => {
    authVisitor = new AuthVisitor();
  });

  describe('visit', () => {
    it('should return extensions with trusted flag and user data when jwt is present', () => {
      const extensions = { someExtension: 'value' };
      const jwtPayload = {
        payload: { sub: 'user-123', roles: ['admin', 'user'] },
      };
      const context = { jwt: jwtPayload };

      const result = authVisitor.visit(extensions, { context } as any);

      expect(result).toEqual({
        ...extensions,
        trusted: true,
        sub: 'user-123',
        roles: ['admin', 'user'],
      });
    });

    it('should return original extensions when jwt is not present', () => {
      const extensions = { someExtension: 'value' };
      const context = { jwt: null };

      const result = authVisitor.visit(extensions, { context } as any);

      expect(result).toBe(extensions);
    });

    it('should return original extensions when context is undefined', () => {
      const extensions = { someExtension: 'value' };

      const result = authVisitor.visit(extensions, {} as any);

      expect(result).toBe(extensions);
    });

    it('should extract sub and roles from jwt payload correctly', () => {
      const extensions = {};
      const jwtPayload = {
        payload: { sub: 'user-456', roles: ['viewer'] },
      };
      const context = { jwt: jwtPayload };

      const result =
        authVisitor.visit(extensions, {
          context,
        } as any) ?? {};
      expect(result).toBeDefined();

      expect(result.sub).toBe('user-456');
      expect(result.roles).toEqual(['viewer']);
      expect(result.trusted).toBe(true);
    });

    it('should preserve existing extensions properties', () => {
      const extensions = { query: 'test', timing: { start: 123 } };
      const jwtPayload = {
        payload: { sub: 'user-789', roles: ['admin'] },
      };
      const context = { jwt: jwtPayload };

      const result = authVisitor.visit(extensions, { context } as any);

      expect(result).toHaveProperty('query', 'test');
      expect(result).toHaveProperty('timing');
    });
  });
});
