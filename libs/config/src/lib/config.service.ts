import { Logger } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { join } from 'path';

export abstract class BaseConfigService {
  protected readonly logger = new Logger(BaseConfigService.name);
  private _environment: string;
  private _HMACSecret: string;
  private _schemaFile: string;
  private _name: string;
  private _port: number | undefined;

  constructor() {
    this._environment = process.env['NODE_ENV'] || 'development';
    this._schemaFile = join(
      process.cwd(),
      `generated/${process.env['SCHEMA_FILE'] || 'schema.gql'}`,
    );
    this._name = process.env['NAME'] || 'service';
    this._port = process.env['PORT']
      ? parseInt(process.env['PORT'], 10)
      : undefined; // If PORT is not set, we'll find a random port later
    
    const hmacSecretValue = process.env['HMAC_SECRET'];
    if (!hmacSecretValue || isEmpty(hmacSecretValue)) {
      throw new Error('HMAC_SECRET must be set');
    } else {
      this._HMACSecret = hmacSecretValue;
    }

    if (this.isDev()) {
      this.logger.log(`⚙️ Configuring for development environment`);
      // Add development-specific configuration here
    } else {
      this.logger.log(`⚙ Configuring for production environment`);
      // Add production-specific configuration here
    }
  }

  public setPort(port: number) {
    if (this._port === undefined) {
      this._port = port;
    } else {
      throw new Error('Port is already set');
    }
  }

  get port(): number | undefined {
    return this._port;
  }

  get schemaFile() {
    return this._schemaFile;
  }

  public isDev(): boolean {
    return this._environment === 'development';
  }

  get name() {
    return this._name;
  }

  get HMACSecret() {
    return this._HMACSecret;
  }
}
