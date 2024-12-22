import { Module } from '@nestjs/common';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { EndpointsService } from '../endpoints/endpoints.service';
import { LocalSigningKeyProvider } from './local-signing-key-provider';

@Module({
  imports: [EndpointsModule],
  providers: [LocalSigningKeyProvider, EndpointsService],
  exports: [LocalSigningKeyProvider],
})
export class CryptoModule {}
