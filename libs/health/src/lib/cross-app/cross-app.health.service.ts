import { Injectable, Logger } from '@nestjs/common';
import { RestCrossAppClient } from '@org/cross-app';

@Injectable()
export class CrossAppHealthService {
  private readonly logger = new Logger(CrossAppHealthService.name);

  constructor(private readonly restClient: RestCrossAppClient) {}

  async checkIn(): Promise<boolean> {
    this.logger.debug(`Checking in with ${this.restClient.url}`);
    const response = await this.restClient.query();
    return response.status === 200;
  }
}
