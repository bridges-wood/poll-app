import { Module } from '@nestjs/common';
import { LogModule } from '@org/log';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { EndpointsService } from '../endpoints/endpoints.service';
import { LocalSigningKeyProvider } from './local-signing-key-provider';

@Module({
  imports: [EndpointsModule, LogModule],
  providers: [LocalSigningKeyProvider, EndpointsService],
  exports: [LocalSigningKeyProvider],
})
export class CryptoModule {}
