import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLFormattedError } from 'graphql';
import { ErrorFormatter } from './formatter';

describe('ErrorFormatter', () => {
  let service: ErrorFormatter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorFormatter],
    }).compile();

    service = module.get<ErrorFormatter>(ErrorFormatter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should format error without originalError', () => {
    const formattedError: GraphQLFormattedError = {
      message: 'Test error message',
      extensions: {
        code: 'TEST_CODE',
      },
    };

    const result = service.format(formattedError);
    expect(result).toEqual({
      message: 'Test error message',
      code: 'TEST_CODE',
    });
  });

  it('should format error with originalError', () => {
    const originalError = new Error('Original error message');
    const formattedError: GraphQLFormattedError = {
      message: 'Test error message',
      extensions: {
        code: 'TEST_CODE',
        originalError,
      },
    };

    const result = service.format(formattedError);
    expect(result).toEqual({
      message: 'Original error message',
      code: 'TEST_CODE',
    });
  });

  it('should handle missing extension fields gracefully', () => {
    const formattedError: GraphQLFormattedError = {
      message: 'Test error message',
    };

    const result = service.format(formattedError);
    expect(result).toEqual({
      message: 'Test error message',
      code: undefined,
    });
  });
});
