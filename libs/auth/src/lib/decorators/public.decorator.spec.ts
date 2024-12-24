import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public Decorator', () => {
  @Public()
  class TestClass {}

  it('should set metadata with key "isPublic" and value true', () => {
    const metadataKey = IS_PUBLIC_KEY;
    const metadataValue = true;

    const metadata = Reflect.getMetadata(metadataKey, TestClass);

    expect(metadata).toBe(metadataValue);
  });
});
