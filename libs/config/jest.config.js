const { baseConfig } = require('../../jest.config.base');

const config = {
  ...baseConfig,
  displayName: 'config',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/config',
  setupFilesAfterEnv: ['<rootDir>/src/test/env-setup.ts'],
};

module.exports = config;
