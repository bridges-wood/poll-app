import { Injectable } from '@nestjs/common';
import { RestCrossAppClient } from '@org/cross-app';
import { BaseLogger } from '@org/log';

@Injectable()
export class CrossAppHealthService {
  constructor(
    private readonly restClient: RestCrossAppClient,
    private readonly logger: BaseLogger,
  ) {
    this.logger.setContext(CrossAppHealthService.name);
  }

  async checkIn(): Promise<boolean> {
    this.logger.debug(`Checking in with ${this.restClient.url}`);
    const response = await this.restClient.query();
    return response.status === 200;
  }
}
