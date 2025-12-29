import { ExecutionRequest } from '@graphql-tools/utils';
import { Inject, Injectable } from '@nestjs/common';
import HmacConfigFactory, { HmacConfig } from '@org/config/hmac.config.factory';
import {
  HMAC_SIGNATURE_EXTENSION,
  computeHmacSignature,
} from '@org/graphql/plugins';
import { print } from 'graphql';
import { ExtensionVisitor } from './extension.visitor';

@Injectable()
export class SignatureVisitor implements ExtensionVisitor {
  constructor(
    @Inject(HmacConfigFactory.KEY)
    private readonly hmacConfig: HmacConfig,
  ) {}

  visit(
    extensions: ExecutionRequest['extensions'],
    { document, variables }: Omit<ExecutionRequest, 'extensions'>,
  ): ExecutionRequest['extensions'] {
    const query = print(document);
    return {
      ...extensions,
      [HMAC_SIGNATURE_EXTENSION]: computeHmacSignature(
        { query, variables, extensions },
        this.hmacConfig.secret,
      ), // ! This has to be done here because the stitched schema is implemented with custom resolvers, not plugins
    };
  }
}
