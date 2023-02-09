import { Linter } from 'eslint';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker-js/issues/391 for more info
export const LINT_RULES_OVERRIDES: Linter.Config['rules'] = {
  'no-unused-vars': 'off',
  'import/no-unresolved': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-empty-function': 'off',
};
