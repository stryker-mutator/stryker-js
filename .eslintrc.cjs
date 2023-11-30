module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
    project: [require.resolve('./tsconfig.lint.json')],
  },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/all', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'unicorn'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // unicorn rules
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],

    // import rules
    'import/newline-after-import': 1,
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      },
    ],
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: false, optionalDependencies: false, peerDependencies: true }],

    // prettier rules
    'prettier/prettier': ['error'],
    '@typescript-eslint/lines-around-comment': 'off',

    // customized typescript-eslint rules
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple',
      },
    ],
    '@typescript-eslint/no-extra-parens': ['error', 'functions'],
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        overrides: {
          constructors: 'no-public',
          properties: 'explicit',
        },
      },
    ],
    '@typescript-eslint/method-signature-style': ['error', 'method'],
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true,
        allowedNames: ['self'],
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_*', ignoreRestSiblings: true, varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/class-methods-use-this': 'off',

    // disabled typescript-eslint rules we should enable in some way

    // fix - separate PR
    '@typescript-eslint/naming-convention': 'off',

    // fix - separate PR
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/await-thenable': 'off',

    // fix - separate PR
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',

    // fix - separate PR
    '@typescript-eslint/no-base-to-string': 'off',

    // fix - separate PR
    '@typescript-eslint/init-declarations': 'off',

    // Long term to fix
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/parameter-properties': 'off',

    // disabled typescript-eslint rules

    // handled by prettier / our style
    '@typescript-eslint/member-ordering': 'off', // we do not need it
    '@typescript-eslint/lines-between-class-members': 'off', // not our style

    // useful
    '@typescript-eslint/no-type-alias': 'off', // it is useful!
    '@typescript-eslint/no-use-before-define': 'off', // we use it e.x in injections
    '@typescript-eslint/no-confusing-void-expression': 'off', // sometimes usable
    '@typescript-eslint/no-invalid-this': 'off', // we promise to be careful
    '@typescript-eslint/no-dynamic-delete': 'off', // we promise to be careful
    '@typescript-eslint/no-non-null-assertion': 'off', // sometimes usable

    // can't do nothing about it
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    // we do not care
    '@typescript-eslint/max-params': 'off',
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
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // These do not work with jsdoc: https://github.com/typescript-eslint/typescript-eslint/issues/906
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
      },
    },
    {
      files: ['packages/*/test/**/*.+(ts|cts|mts)', 'tasks/*.js', 'packages/test-helpers/**/*.+(ts|cts|mts)'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
