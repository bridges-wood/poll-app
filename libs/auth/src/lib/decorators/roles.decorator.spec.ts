import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

describe('Roles Decorator', () => {
  let reflector: Reflector;

  beforeAll(() => {
    reflector = new Reflector();
  });

  it('should set metadata with key "roles" and value ["admin"]', () => {
    const metadataValue = ['admin'];
    class TestClass {
      @Roles(metadataValue)
      test() {
        return 'test';
      }
    }

    const metadata = reflector.get(Roles, new TestClass().test);

    expect(metadata).toEqual(metadataValue);
  });
});
