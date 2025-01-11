import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@org/config';
import { BaseLogger } from '@org/log';
import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'graphql';
import * as yaml from 'js-yaml';
import { isEmpty, partition } from 'lodash';
import { join } from 'path';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { Endpoint } from '../endpoints/models/endpoint.model';

// TODO investigate Nest configuration module

@Injectable()
export class ConfigService extends BaseConfigService {
  private endpoints: Endpoint[] = [];
  private queries: string[] = [];
  private ConfigSchema = z
    .object({
      endpoints: z
        .array(
          z.object({
            name: z.string(),
            hash: z.string(),
            url: z.string(),
            description: z.string().optional(),
            hasJwks: z.boolean().optional().default(false),
          }),
        )
        .default([]),
    })
    .optional();

  constructor(logger: BaseLogger) {
    super(logger);
    this.logger.setContext(ConfigService.name);
    this.loadConfigFromFile();
    this.loadConfigFromEnv();
    this.loadDefaultQueries();
    this.logger.log(`🏁 Configuration complete`);
  }

  private loadDefaultQueries() {
    const path = join(__dirname, 'assets/gql');
    const files = readdirSync(path).filter(
      (file) => file.endsWith('.gql') || file.endsWith('.graphql'),
    );
    this.logger.log(`Loading ${files.length} queries from ${path}`);
    for (const file of files) {
      try {
        this.logger.debug(`Loading query ${file}`);
        const content = readFileSync(join(path, file), 'utf8');
        // Check if the file is a valid query
        parse(content);

        this.queries.push(content);
      } catch (error) {
        this.logger.error(
          `Failed to load query ${file}: ${fromError(error).toString()}`,
        );
      }
    }
    this.logger.log(`Successfully loaded ${files.length} queries`);
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
        url: `https://${process.env[host]}:${process.env[ports[index]]}/graphql`,
        hasJwks: false,
      })),
    );

    if (hosts.length > 0) {
      this.logger.log('Successfully loaded config from environment variables');
    }
  }

  private generateRandomHash(): string {
    return createHash('sha1').update(Math.random().toString()).digest('hex');
  }

  public getEndpoints(): Endpoint[] {
    return this.endpoints;
  }

  public getQueries(): string[] {
    return this.queries;
  }
}
