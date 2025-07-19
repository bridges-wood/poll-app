import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as jose from 'jose';
import { join } from 'path';
import { LocalCryptoService } from './local.crypto.service';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('jose', () => ({
  generateKeyPair: jest.fn(),
  exportSPKI: jest.fn(),
  exportPKCS8: jest.fn(),
  importSPKI: jest.fn(),
  importPKCS8: jest.fn(),
}));

describe('LocalCryptoService', () => {
  let service: LocalCryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCryptoService,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    service = module.get<LocalCryptoService>(LocalCryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publicKey', () => {
    it('should throw an error if the public key is not defined', async () => {
      service['_publicKey'] = undefined;
      service['_privateKey'] = {
        type: 'private',
      };

      expect(() => service['publicKey']).toThrow();
    });

    it('should return the public key', async () => {
      service['_publicKey'] = {
        type: 'public',
      };

      expect(service['publicKey']).toBe(service['_publicKey']);
    });
  });

  describe('setupKeysIfUndefined', () => {
    it('should generate and export keys if public key is not defined', async () => {
      service['_privateKey'] = {
        type: 'private',
      };
      jest.spyOn(service as never, 'loadKeyPairFromFile').mockImplementation();
      jest.spyOn(service as never, 'generateKeyPair').mockImplementation();
      jest.spyOn(service as never, 'exportKeyPairToFile').mockImplementation();

      await service['setupKeysIfUndefined']();

      expect(service['loadKeyPairFromFile']).toHaveBeenCalled();
      expect(service['generateKeyPair']).toHaveBeenCalled();
      expect(service['exportKeyPairToFile']).toHaveBeenCalled();
    });

    it('should generate and export keys if private key is not defined', async () => {
      service['_publicKey'] = {
        type: 'public',
      };
      jest.spyOn(service as never, 'loadKeyPairFromFile').mockImplementation();
      jest.spyOn(service as never, 'generateKeyPair').mockImplementation();
      jest.spyOn(service as never, 'exportKeyPairToFile').mockImplementation();

      await service['setupKeysIfUndefined']();

      expect(service['loadKeyPairFromFile']).toHaveBeenCalled();
      expect(service['generateKeyPair']).toHaveBeenCalled();
      expect(service['exportKeyPairToFile']).toHaveBeenCalled();
    });

    it('should not generate keys if both are defined', async () => {
      service['_publicKey'] = {
        type: 'public',
      };
      service['_privateKey'] = {
        type: 'private',
      };
      jest.spyOn(service as never, 'loadKeyPairFromFile').mockImplementation();
      jest.spyOn(service as never, 'generateKeyPair').mockImplementation();
      jest.spyOn(service as never, 'exportKeyPairToFile').mockImplementation();

      await service['setupKeysIfUndefined']();

      expect(service['loadKeyPairFromFile']).not.toHaveBeenCalled();
      expect(service['generateKeyPair']).not.toHaveBeenCalled();
      expect(service['exportKeyPairToFile']).not.toHaveBeenCalled();
    });

    it('should not generate if keys are set after being loaded', async () => {
      service['_publicKey'] = undefined;
      service['_privateKey'] = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service as any, 'loadKeyPairFromFile').mockImplementation(() => {
        service['_publicKey'] = 'publicKey' as unknown as jose.KeyLike;
        service['_privateKey'] = 'privateKey' as unknown as jose.KeyLike;
        return Promise.resolve();
      })
      jest.spyOn(service as never, 'generateKeyPair').mockImplementation();
      jest.spyOn(service as never, 'exportKeyPairToFile').mockImplementation();

      await service['setupKeysIfUndefined']();

      expect(service['loadKeyPairFromFile']).toHaveBeenCalled();
      expect(service['generateKeyPair']).not.toHaveBeenCalled();
      expect(service['exportKeyPairToFile']).not.toHaveBeenCalled();
    });
  });

  describe('exportKeyPairToFile', () => {
    it('should create directory and write keys to files', async () => {
      service['_publicKey'] = 'publicKey' as unknown as jose.KeyLike;
      service['_privateKey'] = 'privateKey' as unknown as jose.KeyLike;

      (existsSync as jest.Mock).mockReturnValue(false);
      (jose.exportSPKI as jest.Mock).mockResolvedValue('publicKey');
      (jose.exportPKCS8 as jest.Mock).mockResolvedValue('privateKey');

      await service['exportKeyPairToFile']();

      expect(mkdirSync).toHaveBeenCalledWith(join(__dirname, 'assets/auth'), {
        recursive: true,
      });
      expect(writeFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/public-key.pem'),
        'publicKey',
      );
      expect(writeFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/private-key.pem'),
        'privateKey',
      );
    });

    it('should not create directory if it already exists', async () => {
      service['_publicKey'] = 'publicKey' as unknown as jose.KeyLike;
      service['_privateKey'] = 'privateKey' as unknown as jose.KeyLike;

      (existsSync as jest.Mock).mockReturnValue(true);
      (jose.exportSPKI as jest.Mock).mockResolvedValue('publicKey');
      (jose.exportPKCS8 as jest.Mock).mockResolvedValue('privateKey');

      await service['exportKeyPairToFile']();

      expect(mkdirSync).not.toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/public-key.pem'),
        'publicKey',
      );

      expect(writeFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/private-key.pem'),
        'privateKey',
      );
    });
  });

  describe('loadKeyPairFromFile', () => {
    it('should load keys from files if they exist', async () => {
      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue('keyData');
      (jose.importSPKI as jest.Mock).mockResolvedValue('publicKey');
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('privateKey');

      await service['loadKeyPairFromFile']();

      expect(readFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/public-key.pem'),
      );
      expect(readFileSync).toHaveBeenCalledWith(
        join(__dirname, 'assets/auth/private-key.pem'),
      );
    });

    it('should not load keys if files do not exist', async () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      await service['loadKeyPairFromFile']();

      expect(readFileSync).not.toHaveBeenCalled();
    });
  });

  describe('generateKeyPair', () => {
    it('should generate a new key pair', async () => {
      const mockKeyPair = { publicKey: 'publicKey', privateKey: 'privateKey' };
      (jose.generateKeyPair as jest.Mock).mockResolvedValue(mockKeyPair);

      await service['generateKeyPair']();

      expect(service['publicKey']).toBe(mockKeyPair.publicKey);
    });
  });

  describe('exportPublicKey', () => {
    it('should export the public key', async () => {
      service['_publicKey'] = 'publicKey' as unknown as jose.KeyLike;
      jest.spyOn(service as never, 'setupKeysIfUndefined').mockImplementation();
      (jose.exportSPKI as jest.Mock).mockResolvedValue('publicKey');

      const result = await service.exportPublicKey();

      expect(service['setupKeysIfUndefined']).toHaveBeenCalled();
      expect(result).toBe('publicKey');
    });
  });

  describe('exportPrivateKey', () => {
    it('should export the private key', async () => {
      service['_privateKey'] = 'privateKey' as unknown as jose.KeyLike;
      jest.spyOn(service as never, 'setupKeysIfUndefined').mockImplementation();
      (jose.exportPKCS8 as jest.Mock).mockResolvedValue('privateKey');

      const result = await service.exportPrivateKey();

      expect(service['setupKeysIfUndefined']).toHaveBeenCalled();
      expect(result).toBe('privateKey');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
