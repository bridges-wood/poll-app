const { baseConfig } = require('../../jest.config.base');

const config = {
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

module.exports = config;
