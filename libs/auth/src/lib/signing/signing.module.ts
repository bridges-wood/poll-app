import { Module } from '@nestjs/common';
import { CrossAppModule } from '@org/cross-app';
import { RemoteSigningKeyProvider } from './remote.signing-key.provider';
import { CacheModule } from '@org/cache';

@Module({
  imports: [CrossAppModule, CacheModule],
  providers: [RemoteSigningKeyProvider],
  exports: [RemoteSigningKeyProvider],
})
export class SigningModule {}
