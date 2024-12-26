import { INestApplication, Logger } from '@nestjs/common';
import { range, sample } from 'lodash';

export async function findAndListenOnPort(
  app: INestApplication<unknown>,
  start: number,
  end: number,
): Promise<number> {
  // Create a set of candidate ports from start to end
  const candidatePorts = new Set<number>(range(start, end + 1));

  let port = -1;
  while (candidatePorts.size > 0) {
    port = sample(Array.from(candidatePorts)) as number;
    try {
      await app.listen(port);
      break;
    } catch {
      Logger.debug(`Port ${port} is in use, trying next port...`);
      candidatePorts.delete(port);
    }
  }

  if (candidatePorts.size === 0) {
    throw new Error(`No available ports in range ${start}-${end}`);
  } else {
    return port;
  }
}
