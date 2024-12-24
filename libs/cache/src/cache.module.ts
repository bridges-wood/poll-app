import { Module } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';
import { CACHE_INSTANCE } from './constants';

@Module({
  providers: [
    {
      provide: CACHE_INSTANCE,
      useFactory: () => {
        return new CacheableMemory({ lruSize: 1000, ttl: '4h' });
      },
    },
  ],
  exports: [CACHE_INSTANCE],
})
export class CacheModule {}
