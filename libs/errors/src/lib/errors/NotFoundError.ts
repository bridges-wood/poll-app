import { GraphQLError } from 'graphql';

export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
