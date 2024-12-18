import { Module } from "@nestjs/common";
import { EndpointsModule } from "../endpoints/endpoints.module";
import { SigningKeyProviderFactory } from "./signing-key-provider.factory";
import { EndpointsService } from "../endpoints/endpoints.service";

@Module({
  imports: [EndpointsModule],
  providers: [SigningKeyProviderFactory, EndpointsService],
  exports: [SigningKeyProviderFactory],
})
export class CryptoModule {}