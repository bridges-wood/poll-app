const { baseConfig } = require('../../jest.config.base');

const /** @type {import('jest').Config} */
config = {
  ...baseConfig,
  displayName: 'auth',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/auth',
  setupFiles: ['<rootDir>/src/test/env-setup.ts'],
};

module.exports = config;
