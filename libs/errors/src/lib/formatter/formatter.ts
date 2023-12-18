import { Injectable } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

interface OutputError {
  message: string;
  [key: string]: unknown;
}

@Injectable()
export class ErrorFormatter {
  x = 1;
  format(formattedError: GraphQLFormattedError): OutputError {
    const originalError = formattedError.extensions?.['originalError'] as Error;

    if (!originalError) {
      return {
        message: formattedError.message,
        code: formattedError.extensions?.['code'],
      };
    }

    return {
      message: originalError.message,
      code: formattedError.extensions?.['code'],
    };
  }
}
