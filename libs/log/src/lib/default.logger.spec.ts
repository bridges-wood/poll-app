import { Test, TestingModule } from '@nestjs/testing';
import { BaseLogger } from './base.logger';
import { DefaultLogger } from './default.logger';

jest.mock('./base.logger');

describe('DefaultLogger', () => {
  let logger: DefaultLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultLogger],
    }).compile();

    logger = await module.resolve<DefaultLogger>(DefaultLogger);
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should call log method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.info(message, ...optionalParams);
    expect(BaseLogger.prototype.log).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });

  it('should call error method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.error(message, ...optionalParams);
    expect(BaseLogger.prototype.error).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });

  it('should call warn method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.warn(message, ...optionalParams);
    expect(BaseLogger.prototype.warn).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });

  it('should call debug method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.debug(message, ...optionalParams);
    expect(BaseLogger.prototype.debug).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });

  it('should call verbose method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.verbose(message, ...optionalParams);
    expect(BaseLogger.prototype.verbose).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });

  it('should call fatal method of BaseLogger with correct parameters', () => {
    const message = 'test message';
    const optionalParams = ['param1', 'param2'];

    logger.fatal(message, ...optionalParams);
    expect(BaseLogger.prototype.fatal).toHaveBeenCalledWith(
      message,
      ...optionalParams,
    );
  });
});
