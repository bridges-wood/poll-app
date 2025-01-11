import { ConsoleLogger } from '@nestjs/common';
import { YogaLogger } from 'graphql-yoga';

export abstract class BaseLogger extends ConsoleLogger implements YogaLogger {
  abstract info(message: unknown, ...optionalParams: unknown[]): void;
}
