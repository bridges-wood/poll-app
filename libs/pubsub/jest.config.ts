import { Config } from 'jest';
import { baseConfig } from '../../jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'pubsub',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/pubsub',
};

export default config;
