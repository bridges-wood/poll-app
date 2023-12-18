import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class ConfigService {
  private environment: string;
  private _schemaFile: string;

  constructor() {
    this.environment = process.env['NODE_ENV'] || 'development';
    this._schemaFile = join(
      process.cwd(),
      `generated/${process.env['SCHEMA_FILE'] || 'schema.gql'}`
    );
  }

  get schemaFile() {
    return this._schemaFile;
  }

  public isDev(): boolean {
    return this.environment === 'development';
  }
}
