import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class ConfigService {
  private _environment: string;
  private _schemaFile: string;
  private _gatewayUrl: string;

  constructor() {
    this._environment = process.env['NODE_ENV'] || 'development';
    this._schemaFile = join(
      process.cwd(),
      `generated/${process.env['SCHEMA_FILE'] || 'schema.gql'}`,
    );
    this._gatewayUrl =
      process.env['GATEWAY_URL'] || 'http://localhost:3000/graphql';
  }

  get schemaFile() {
    return this._schemaFile;
  }

  public isDev(): boolean {
    return this._environment === 'development';
  }

  get gatewayUrl() {
    return this._gatewayUrl;
  }
}
