import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'require-await': 'warn',
    },
  },
  {
    // Browser-specific config for client-side files
    files: ['public/**/*.js', 'locked-ui/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // Browser scripts are typically not modules
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
    ],
  },
];
