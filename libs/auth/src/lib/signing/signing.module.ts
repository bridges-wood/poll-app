import { Module } from '@nestjs/common';
import { CacheModule } from '@org/cache';
import { CrossAppModule } from '@org/cross-app';
import { LogModule } from '@org/log';
import { RemoteSigningKeyProvider } from './remote.signing-key.provider';

@Module({
  imports: [CrossAppModule, CacheModule, LogModule],
  providers: [RemoteSigningKeyProvider],
  exports: [RemoteSigningKeyProvider],
})
export class SigningModule {}
