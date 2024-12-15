import { Injectable, Logger } from '@nestjs/common';
import { CrossAppClient } from './base.client';

@Injectable()
export class RestCrossAppClient implements CrossAppClient {
  private logger = new Logger(RestCrossAppClient.name);
  private token: string | undefined;

  constructor(public readonly url: string) {
    this.logger.debug(`Creating client for URL: ${url}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<Body extends Record<string, any> = Record<string, any>>(
    path?: string,
    body?: Body,
  ): Promise<Response> {
    const response = fetch(`${this.url}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });

    this.token = undefined;
    return response;
  }

  impersonating(token: string): CrossAppClient {
    this.logger.debug(`Impersonating as user with token: ${token}`);
    this.token = token;
    return this as CrossAppClient;
  }
}
