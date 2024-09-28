// @ts-check
import eslint from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// @ts-expect-error: No types available
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import { rules } from '../eslint.config.js';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: { 'chai-friendly': pluginChaiFriendly },
    rules: {
      ...rules,
      '@typescript-eslint/no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': 'error',

      // Handled by typescript
      'no-undef': 'off',
    },
  },
  {
    ignores: [
      'test/*/*.js',
      'test/*/*.ts',
      'test/*/src/**',
      'test/*/test/**',
      'test/*/tests/**',
      'test/*/client/**',
      'test/*/spec/**',
      'test/*/tasks/**',
      'test/*/features/**',
      'test/*/cucumber-features/**',
      'test/*/sampleProject/**',
      'test/*/__mocks__/**',
      'test/*/packages/**',
      'test/*/lib/**',
      'test/*/karma.conf.cjs',
      '**/.svelte-kit/**',
      '**/.stryker-tmp/**',
      '**/stryker-tmp/**',
    ],
  },
);
