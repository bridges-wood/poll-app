/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { BaseLogger } from '../lib/base.logger';

@Injectable()
export class TestLogger extends BaseLogger {
  constructor() {
    super();
  }

  override setContext = jest.fn((_context: string) => {});

  override log = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override info = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override fatal = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override error = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override warn = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override debug = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );

  override verbose = jest.fn(
    (_message: unknown, ..._optionalParams: unknown[]) => {},
  );
}
