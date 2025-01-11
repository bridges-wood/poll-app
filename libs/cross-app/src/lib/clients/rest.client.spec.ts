import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { RestCrossAppClient } from './rest.client';

describe('RestCrossAppClient', () => {
  let client: RestCrossAppClient;
  const url = 'http://example.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
        {
          provide: RestCrossAppClient,
          useFactory: (logger: BaseLogger) =>
            new RestCrossAppClient(url, logger),
          inject: [BaseLogger],
        },
      ],
    }).compile();

    client = module.get<RestCrossAppClient>(RestCrossAppClient);
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should set token when impersonating', () => {
    const token = 'test-token';
    client.impersonating(token);
    expect(client['token']).toBe(token);
  });

  it('should make a GET request with correct headers', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response());

    const path = '/test-path';
    const body = { key: 'value' };
    const token = 'test-token';
    client.impersonating(token);

    await client.query(path, body);

    expect(fetchSpy).toHaveBeenCalledWith(`${url}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  });
});
