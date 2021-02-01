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
  extends: ['prettier', 'plugin:@typescript-eslint/all'],
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
    'import/newline-after-import': 1,
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index']
      }
    ],
    'import/no-default-export': 'error',

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

    // disabled typescript-eslint rules we should enable in some way
    '@typescript-eslint/no-require-imports': 'off', // should remove some of remaining `import {} = require()` [import sinon = require('sinon')]
    '@typescript-eslint/no-shadow': 'off', // sometimes can be confusing
    '@typescript-eslint/sort-type-union-intersection-members': 'off', // fixable and provides alphabetical order so :)
    '@typescript-eslint/consistent-type-imports': 'off', // I think it cleans stuff a little bit (using nice 'import type' feature)
    '@typescript-eslint/naming-convention': 'off', // we wanted it previously - naming convention for variables. It finally has some great API
    '@typescript-eslint/require-await': 'off', // we can take a look O.O
    '@typescript-eslint/promise-function-async': 'off', // we can take a look O.O
    '@typescript-eslint/no-this-alias': 'off', // maybe allow 'self' only
    '@typescript-eslint/no-unused-vars': 'off', // allow only _
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // available only from node 14
    '@typescript-eslint/explicit-function-return-type': 'off', // could take a look tho
    '@typescript-eslint/explicit-module-boundary-types': 'off', // could take a look tho
    '@typescript-eslint/no-unnecessary-condition': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/no-duplicate-imports': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/consistent-indexed-object-style': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/prefer-optional-chain': 'off', // should check our types and syntax and switch it on
    'prefer-const': 'off', // why have we switched it off?
    '@typescript-eslint/no-misused-promises': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/switch-exhaustiveness-check': 'off', // should check our types and syntax and switch it on (or off)
    '@typescript-eslint/no-base-to-string': 'off', // ee? try it.
    '@typescript-eslint/dot-notation': 'off', // should check our types and syntax and switch it on (or off)
    '@typescript-eslint/prefer-reduce-type-parameter': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/return-await': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/non-nullable-type-assertion-style': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/no-inferrable-types': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/no-empty-interface': 'off', // should check our types and syntax and switch it on
    '@typescript-eslint/await-thenable': 'off',

    // disabled typescript-eslint rules

    // handled by prettier / our style
    '@typescript-eslint/comma-dangle': 'off', // prettier
    '@typescript-eslint/indent': 'off', // prettier
    '@typescript-eslint/object-curly-spacing': 'off', // prettier
    '@typescript-eslint/space-before-function-paren': 'off', // prettier
    '@typescript-eslint/member-ordering': 'off', // we do not need it
    '@typescript-eslint/lines-between-class-members': 'off', // not our style

    // useful
    '@typescript-eslint/no-type-alias': 'off', // it is useful!
    '@typescript-eslint/no-use-before-define': 'off', // we use it e.x in injections
    '@typescript-eslint/no-confusing-void-expression': 'off', // sometimes usable
    '@typescript-eslint/unbound-method': 'off', // we promise to be careful
    '@typescript-eslint/no-invalid-this': 'off', // we promise to be careful
    '@typescript-eslint/no-floating-promises': 'off', // sometimes usable
    '@typescript-eslint/init-declarations': 'off', // sometimes inconvinient
    '@typescript-eslint/no-dynamic-delete': 'off', // we promise to be careful
    '@typescript-eslint/no-non-null-assertion': 'off', // sometimes usable
    '@typescript-eslint/no-empty-function': 'off', // we need empty functions...

    // can't do nothing about it
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-namespace': 'off',

    // we do not care
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/prefer-enum-initializers': 'off',
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-implicit-any-catch': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/default-param-last': 'off',
  }
};
