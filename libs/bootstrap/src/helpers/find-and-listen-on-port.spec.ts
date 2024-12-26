import { INestApplication } from '@nestjs/common';
import { findAndListenOnPort } from './find-and-listen-on-port';

describe('findAndListenOnPort', () => {
  let app: INestApplication;

  beforeEach(() => {
    app = {
      listen: jest.fn(),
    } as unknown as INestApplication;
  });

  it('should find and listen on an available port', async () => {
    (app.listen as jest.Mock).mockResolvedValueOnce(true);

    const port = await findAndListenOnPort(app, 3000, 3005);
    expect(port).toBeGreaterThanOrEqual(3000);
    expect(port).toBeLessThanOrEqual(3005);
    expect(app.listen).toHaveBeenCalledWith(port);
  });

  it('should try multiple ports until it finds an available one', async () => {
    (app.listen as jest.Mock)
      .mockRejectedValueOnce(new Error('Port in use'))
      .mockRejectedValueOnce(new Error('Port in use'))
      .mockResolvedValueOnce(true);

    const port = await findAndListenOnPort(app, 3000, 3005);
    expect(port).toBeGreaterThanOrEqual(3000);
    expect(port).toBeLessThanOrEqual(3005);
    expect(app.listen).toHaveBeenCalledTimes(3);
  });

  it('should throw an error if no ports are available', async () => {
    (app.listen as jest.Mock).mockRejectedValue(new Error('Port in use'));

    await expect(findAndListenOnPort(app, 3000, 3002)).rejects.toThrow(
      'No available ports in range 3000-3002',
    );
    expect(app.listen).toHaveBeenCalledTimes(3);
  });
});
