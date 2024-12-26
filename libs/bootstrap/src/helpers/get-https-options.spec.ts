import { readFileSync } from 'fs';
import { join } from 'path/posix';
import { getHttpsOptions } from './get-https-options';

jest.mock('fs');
jest.mock('path/posix');

describe('getHttpsOptions', () => {
  const mockKey = 'mockKey';
  const mockCert = 'mockCert';
  const keyRelativePath = 'assets/ssl/key.pem';
  const certRelativePath = 'assets/ssl/cert.pem';

  beforeEach(() => {
    (readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.endsWith(keyRelativePath)) return mockKey;
      if (path.endsWith(certRelativePath)) return mockCert;
      throw new Error('Invalid path');
    });

    (join as jest.Mock).mockImplementation((...paths: string[]) =>
      paths.join('/'),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return https options with key and cert', () => {
    const httpsOptions = getHttpsOptions();

    expect(httpsOptions).toEqual({
      key: mockKey,
      cert: mockCert,
    });
    expect(readFileSync).toHaveBeenCalledWith(
      expect.stringContaining(keyRelativePath),
    );
    expect(readFileSync).toHaveBeenCalledWith(
      expect.stringContaining(certRelativePath),
    );
  });

  it('should call join with correct paths', () => {
    getHttpsOptions();
    expect(join).toHaveBeenCalledWith(__dirname, keyRelativePath);
    expect(join).toHaveBeenCalledWith(__dirname, certRelativePath);
  });
});
