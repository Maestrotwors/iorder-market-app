const tseslint = require('typescript-eslint');
const sheriff = require('@softarc/eslint-plugin-sheriff');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended, sheriff.configs.all],
  },
  {
    files: ['**/endpoints/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['**/microservices/*/src/index.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^app$' }],
    },
  },
  eslintPluginPrettier,
  {
    ignores: ['node_modules/', 'dist/', '.angular/', 'database/', 'config/', 'scripts/'],
  },
);
