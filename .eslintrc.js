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
  extends: ['plugin:@typescript-eslint/all', 'prettier', 'prettier/@typescript-eslint'],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'unicorn'],
  rules: {
    // unicorn rules
    'unicorn/filename-case': [
      'error',
      {
        'case': 'kebabCase'
      }
    ],

    // import rules
    'import/newline-after-import': ['error', { 'count': 1 }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        }
      }
    ],
    'import/no-default-export': 'error',
    // small help from eslint is needed -> sort members of import
    // import { b, a } from 'c' -> import { a, b } from 'c'
    'sort-imports': ['error', {
      'ignoreCase': true,
      'ignoreDeclarationSort': true,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ["none", "all", "multiple", "single"],
      'allowSeparatedGroups': true
    }],

    // prettier rules
    'prettier/prettier': ['error'],

    // customised typescript-eslint rules
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple'
      }
    ],
    '@typescript-eslint/no-extra-parens': ['error', 'functions'],
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        overrides: {
          constructors: 'no-public',
          properties: 'explicit'
        }
      }
    ],
    '@typescript-eslint/method-signature-style': ['error', 'method'],
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        'allowDestructuring': true,
        'allowedNames': ['self'] 
      }
    ],

    // disabled typescript-eslint rules we should enable in some way
   
    // fix - serparate PR
    '@typescript-eslint/naming-convention': 'off',
    
    // fix - separate PR
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
  
    // fix - separate PR
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',

    // fix - separate PR
    '@typescript-eslint/no-base-to-string': 'off',
    
    // fix - serarate PR
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',

    // Long term to fix
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',

    // disabled typescript-eslint rules

    // handled by prettier / our style
    '@typescript-eslint/member-ordering': 'off', // we do not need it
    '@typescript-eslint/lines-between-class-members': 'off', // not our style

    // useful
    '@typescript-eslint/no-type-alias': 'off', // it is useful!
    '@typescript-eslint/no-use-before-define': 'off', // we use it e.x in injections
    '@typescript-eslint/no-confusing-void-expression': 'off', // sometimes usable, explicitly showing our intention
    '@typescript-eslint/no-invalid-this': 'off', // we promise to be careful
    '@typescript-eslint/no-dynamic-delete': 'off', // we promise to be careful
    '@typescript-eslint/no-non-null-assertion': 'off', // we like it, we use it.

    // can't do nothing about it
    '@typescript-eslint/consistent-type-imports': 'off', // breaks with injections
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // somehow doesn't work properly
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off', // we do not like it, we sometimes want more wide check
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    // we do not care
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/prefer-enum-initializers': 'off',
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-implicit-any-catch': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/default-param-last': 'off',
  }
};
