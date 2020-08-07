module.exports = {
  mutate: ['src/**/*.ts'],
  coverageAnalysis: 'perTest',
  checkers: ['typescript'],
  testRunner: 'mocha',
  reporters: ['progress', 'html', 'dashboard'],
  concurrency: 4,
  plugins: [
    require.resolve('./packages/mocha-runner'),
    require.resolve('./packages/typescript-checker'),
  ],
  buildCommand: 'tsc -b',
  files: [
    '{src,test,src-generated}/**/*.ts',
    '!{src,test,src-generated}/**/*.d.ts',
    'schema/**/*.json',
    '*', // files directly in the package directory
    'typings/**/*.ts',
  ]
};

