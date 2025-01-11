import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from '@org/log';
import { TestLogger } from '@org/log/test';
import { generateKeyPair } from 'jose';
import { DynamicCryptoService } from './dynamic.crypto.service';

jest.mock('jose', () => {
  const jose = jest.requireActual('jose');
  return {
    ...jose,
    generateKeyPair: jest.fn().mockImplementation(jose.generateKeyPair),
  };
});

describe('DynamicCryptoService', () => {
  let service: DynamicCryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicCryptoService,
        {
          provide: BaseLogger,
          useClass: TestLogger,
        },
      ],
    }).compile();

    service = module.get<DynamicCryptoService>(DynamicCryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have alg set to PS256', () => {
    expect(service.alg).toBe('PS256');
  });

  it('should throw an error if publicKey is accessed before generation', () => {
    expect(() => service.publicKey).toThrow('Public key not set');
  });

  it('should return the public key', async () => {
    await service.exportPublicKey();
    expect(service.publicKey).toBeDefined();
  });

  it('should generate a key pair if not already set', async () => {
    await service.exportPublicKey();
    expect(generateKeyPair).toHaveBeenCalled();
  });

  it('should not generate a new key pair if already set', async () => {
    await service.exportPublicKey();
    await service.exportPublicKey();

    expect(generateKeyPair).toHaveBeenCalledTimes(1);
  });

  it('should export public key in SPKI format', async () => {
    const spki = await service.exportPublicKey();
    expect(spki).toContain('-----BEGIN PUBLIC KEY-----');
  });

  it('should export private key in PKCS8 format', async () => {
    const pkcs8 = await service.exportPrivateKey();
    expect(pkcs8).toContain('-----BEGIN PRIVATE KEY-----');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
