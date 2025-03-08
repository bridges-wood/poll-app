import { readdirSync, readFileSync } from 'fs';
import { parse } from 'graphql';
import DefaultQueriesFactory from './default-queries.config.factory';

jest.mock('fs');
jest.mock('graphql');
jest.mock('path');

describe('DefaultQueriesFactory', () => {
  it('should load queries from .gql and .graphql files', () => {
    const mockFiles = ['query1.gql', 'query2.graphql'];
    const mockContent = 'query { test }';

    (readdirSync as jest.Mock).mockReturnValue(mockFiles);
    (readFileSync as jest.Mock).mockReturnValue(mockContent);
    (parse as jest.Mock).mockReturnValue({});

    const config = DefaultQueriesFactory();

    expect(config.queries).toEqual([mockContent, mockContent]);
  });

  it('should throw when parsing invalid queries', () => {
    const mockFiles = ['invalid-query.gql'];
    const mockContent = 'invalid query';

    (readdirSync as jest.Mock).mockReturnValue(mockFiles);
    (readFileSync as jest.Mock).mockReturnValue(mockContent);
    (parse as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid query');
    });

    expect(() => DefaultQueriesFactory()).toThrow('Invalid query');
  });
});
