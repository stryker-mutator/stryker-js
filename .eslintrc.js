module.exports = {
  env: {
    node: true
  },
  parserOptions: {
    sourceType: 'module',
    project: [require.resolve('./tsconfig.lint.json')]
  },
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['prettier', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'unicorn'],
  rules: {
    // unicorn config
    'unicorn/filename-case': [
      'error',
      {
        'case': 'kebabCase'
      }
    ],
    // import config
    'import/newline-after-import': 1,
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index']
      }
    ],
    'import/no-default-export': 'error',
    // prettier config
    'prettier/prettier': ['error'],
    // typescript-eslint eslint config
    'sort-imports': 'off',
    'no-case-declarations': 'off',
    'no-constant-condition': 'error',
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple'
      }
    ],
    '@typescript-eslint/await-thenable': 'off', // error in recommended
    '@typescript-eslint/explicit-module-boundary-types': 'off', // warn in recommended
    '@typescript-eslint/brace-style': 'error',
    'camelcase': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        overrides: {
          constructors: 'no-public',
          properties: 'explicit'
        }
      }
    ],
    '@typescript-eslint/func-call-spacing': 'error',
    'no-duplicate-case': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extra-parens': ['error', 'functions'],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off', 
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/typedef': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/unified-signatures': 'error'
  }
};
