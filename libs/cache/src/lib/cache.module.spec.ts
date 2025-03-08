import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from './cache.module';
import { CACHE_INSTANCE } from './constants';
import { CacheableMemory } from 'cacheable';

describe('CacheModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CacheModule],
    }).compile();
  });

  it('should provide CACHE_INSTANCE', () => {
    const cacheInstance = module.get<CacheableMemory>(CACHE_INSTANCE);
    expect(cacheInstance).toBeInstanceOf(CacheableMemory);
  });

  it('should have correct lruSize and ttl', () => {
    const cacheInstance = module.get<CacheableMemory>(CACHE_INSTANCE);
    expect(cacheInstance.lruSize).toBe(1000);
    expect(cacheInstance.ttl).toBe('4h');
  });
});