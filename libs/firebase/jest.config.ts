import type { Config } from 'jest';
import { baseConfig } from '../../jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'firebase',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/firebase',
};

export default config;
