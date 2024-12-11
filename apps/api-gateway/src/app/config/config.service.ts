import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as BaseConfigService } from '@org/config';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { isEmpty, partition } from 'lodash';
import { join } from 'path';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { Endpoint } from '../endpoints/models/endpoint.model';

@Injectable()
export class ConfigService extends BaseConfigService {
  override logger = new Logger(ConfigService.name);
  private environment: string;
  private endpoints: Endpoint[] = [];
  private ConfigSchema = z
    .object({
      endpoints: z
        .array(
          z.object({
            name: z.string(),
            hash: z.string(),
            url: z.string(),
            description: z.string().optional(),
          }),
        )
        .default([]),
    })
    .optional();

  constructor() {
    super('');
    this.environment = process.env.NODE_ENV || 'development';
    this.loadConfigFromFile();
    this.loadConfigFromEnv();
  }

  private loadConfigFromFile(): void {
    const configPath = process.env.CONFIG_PATH || 'assets/config.yml';
    const configFile = readFileSync(join(__dirname, configPath), 'utf8');
    try {
      this.logger.log(`Loading config from ${configPath}`);

      const loadedConfig = yaml.load(configFile);
      const parsedConfig = this.ConfigSchema.parse(loadedConfig);
      if (parsedConfig?.endpoints) {
        this.endpoints = this.endpoints.concat(parsedConfig.endpoints);
      }

      if (isEmpty(parsedConfig)) {
        this.logger.warn(`No valid config found in ${configPath}`);
      } else {
        this.logger.log(`Successfully loaded config from ${configPath}`);
      }
    } catch (error) {
      this.logger.error(`Invalid config: ${fromError(error).toString()}`);
    }
  }

  private loadConfigFromEnv(): void {
    this.logger.log('Loading config from environment variables');
    const endpointCandidates = Object.keys(process.env).filter((key) =>
      key.includes('SVC_CONNECT_SERVICE'),
    );

    // Split endpoint candidates into host and port
    const [hosts, ports] = partition(endpointCandidates, (key) =>
      key.includes('HOST'),
    );

    if (hosts.length !== ports.length) {
      this.logger.error('Invalid endpoint configuration');
      return;
    } else if (hosts.length === 0) {
      this.logger.warn('No endpoints found in environment variables, skipping');
      return;
    }

    this.endpoints = this.endpoints.concat(
      hosts.map((host, index) => ({
        name: host.toLowerCase().split('.')[0],
        hash: this.generateRandomHash(),
        url: `http://${process.env[host]}:${process.env[ports[index]]}/graphql`,
      })),
    );

    if (hosts.length > 0) {
      this.logger.log('Successfully loaded config from environment variables');
    }
  }

  private generateRandomHash(): string {
    return createHash('sha1').update(Math.random().toString()).digest('hex');
  }

  public isDev(): boolean {
    return this.environment === 'development';
  }

  public getEndpoints(): Endpoint[] {
    return this.endpoints;
  }
}
