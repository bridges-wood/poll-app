import { Module } from '@nestjs/common';
import { CrossAppModule } from '@org/cross-app';
import { RemoteSigningKeyProvider } from './remote.signing-key.provider';

@Module({
  imports: [CrossAppModule],
  providers: [RemoteSigningKeyProvider],
  exports: [RemoteSigningKeyProvider],
})
export class SigningModule {}
