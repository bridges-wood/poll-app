import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import _ from 'lodash';
import { join } from 'path';
import { Endpoint, isEndpoint } from '../endpoints/models/endpoint.model';

interface Config {
  endpoints: Endpoint[];
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private environment: string;
  private endpoints: Endpoint[];

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  private loadConfig(): void {
    const configPath = process.env.CONFIG_PATH || 'assets/config.yml';
    const configFile = readFileSync(join(__dirname, configPath), 'utf8');
    try {
      this.logger.log(`Loading config from ${configPath}`);

      const loadedConfig = yaml.load(configFile);
      const parsedConfig = this.validate(loadedConfig);
      this.logger.log(
        `Successfully loaded config for ${parsedConfig.endpoints.length} endpoints`
      );

      this.endpoints = parsedConfig.endpoints;
    } catch (error) {
      throw new Error(`Invalid config: ${error.message}`);
    }
  }

  private validate(config: unknown): Config {
    if (_.isNil(config)) throw new Error('Config is empty');
    if (!_.isObject(config)) throw new Error('Config is not an object');
    if (!_.has(config, 'endpoints'))
      throw new Error('Config does not have endpoints');

    return {
      endpoints: this.validateEndpoints((config as Config).endpoints),
    };
  }

  private validateEndpoints(endpoints: Endpoint[]): Endpoint[] {
    if (!_.isArray(endpoints)) throw new Error('Endpoints is not an array');
    if (endpoints.length === 0) throw new Error('Endpoints is empty');
    if (!endpoints.every((endpoint) => isEndpoint(endpoint)))
      throw new Error('Endpoint is invalid');

    return endpoints;
  }

  public isDev(): boolean {
    return this.environment === 'development';
  }

  public getEndpoints(): Endpoint[] {
    return this.endpoints;
  }
}
