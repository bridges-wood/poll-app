import { Inject, Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { ConfigTokens } from './tokens';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private _environment: string;
  private _schemaFile: string;
  private _gatewayUrl: string;
  private _name: string;
  private _port: number;

  constructor(@Inject(ConfigTokens.GATEWAY_URL) gatewayUrl: string) {
    this._environment = process.env['NODE_ENV'] || 'development';
    this._schemaFile = join(
      process.cwd(),
      `generated/${process.env['SCHEMA_FILE'] || 'schema.gql'}`,
    );
    this._gatewayUrl = gatewayUrl;
    this._name = process.env['NAME'] || 'service';
    this._port = parseInt(process.env['PORT'] || '3000', 10);

    if (this.isDev()) {
      this.logger.log(`Configuring for development environment`);
      // Add development-specific configuration here
    } else {
      this.logger.log(`Configuring for production environment`);
      // Add production-specific configuration here
    }
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

  get name() {
    return this._name;
  }

  get port() {
    return this._port;
  }
}
