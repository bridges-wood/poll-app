import { Module } from '@nestjs/common';
import { Cacheable } from 'cacheable';
import { KeyvLru } from 'keyv-lru';
import { CACHE_INSTANCE } from './constants';

@Module({
  providers: [
    {
      provide: CACHE_INSTANCE,
      useFactory: () => {
        const secondary = new KeyvLru({
          max: 1000,
          nofify: true,
          ttl: 0,
          expire: 0,
        });
        return new Cacheable({ secondary, ttl: '4h' });
      },
    },
  ],
  exports: [CACHE_INSTANCE],
})
export class CacheModule {}
