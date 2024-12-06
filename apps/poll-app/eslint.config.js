const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const baseConfig = require('../../eslint.config.js');
const nextPlugin = require('@next/eslint-plugin-next');
const ts = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  ...baseConfig,
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      ...ts.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_.*|^returns|^type|^of',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
      },
    })),
  {
    ignores: ['**/.next/**/*'],
  },
];
