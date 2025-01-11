import { Injectable, Scope } from '@nestjs/common';
import { BaseLogger } from './base.logger';

@Injectable({ scope: Scope.TRANSIENT })
export class DefaultLogger extends BaseLogger {
  constructor() {
    super();
  }

  info(message: unknown, ...optionalParams: unknown[]) {
    super.log(message, ...optionalParams);
  }
}
