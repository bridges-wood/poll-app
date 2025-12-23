const js = require('@eslint/js');
const baseConfig = require('../../eslint.config.js');
const pluginCypress = require('eslint-plugin-cypress');

module.exports = [
  ...baseConfig,
  { files: ["**/*.js"], plugins: { js } },
  {
    plugins: {
      cypress: pluginCypress,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.cy.{ts,js,tsx,jsx}', 'src/**/*.{ts,js,tsx,jsx}'],
    // Override or add rules here
    rules: {},
  },
];
