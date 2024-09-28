// @ts-check
import eslint from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// @ts-expect-error: No types available
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Rules} */
export const rules = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_*', ignoreRestSiblings: true, varsIgnorePattern: '^_' }],

  // fix - separate PR
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',

  // Handled by typescript
  'no-undef': 'off',

  // We don't care
  '@typescript-eslint/no-explicit-any': 'off',
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.lint.json',
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      },
    },
    rules,
  },
  {
    plugins: { 'chai-friendly': pluginChaiFriendly },
    files: ['packages/*/test/**/*.@(ts|js|mts|cts)'],
    rules: {
      'no-unused-expressions': 'off', // disable original rule
      '@typescript-eslint/no-unused-expressions': 'off', // disable original rule
      'chai-friendly/no-unused-expressions': 'error',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '*.d.ts',
      'packages/*/dist/',
      'packages/*/testResources/**',
      'packages/*/src-generated/**',
      'packages/*/reports/**',
      'packages/*/coverage/**',
      'packages/*/@(stryker.conf.js|.mocharc.cjs|stryker-karma.conf.cjs)',

      // Ignore specific files
      'packages/jasmine-runner/typings/jasmine-types.d.ts',
      'packages/karma-runner/src/karma-plugins/stryker-mutant-coverage-adapter.ts',
      'packages/grunt-stryker/tasks/stryker.js',

      // e2e is linted in the e2e package
      'e2e/',
      'perf/',
      'helpers/',
    ],
  },
);
