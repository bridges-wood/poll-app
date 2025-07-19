const { baseConfig } = require('../../jest.config.base');

const config = {
  ...baseConfig,
  displayName: 'bootstrap',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/bootstrap',
};

module.exports = config;
