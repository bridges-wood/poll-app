import { getJestProjectsAsync } from '@nx/jest';
import { Config } from 'jest';

const config: () => Promise<Config> = async () => ({
  projects: await getJestProjectsAsync(),
});

export default config;
