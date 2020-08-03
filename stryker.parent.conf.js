module.exports = {
  mutate: ['src/**/*.ts'],
  coverageAnalysis: 'perTest',
  tsconfigFile: 'tsconfig.stryker.json',
  mutator: 'typescript',
  transpilers: [
    'typescript'
  ],
  mochaOptions: {
    spec: ['test/helpers/**/*.js', 'test/unit/**/*.js']
  },
  testFramework: 'mocha',
  testRunner: 'mocha',
  reporters: ['progress', 'html', 'dashboard'],
  concurrency: 4,
  plugins: [
    require.resolve('./packages/mocha-runner/src/index'),
    require.resolve('./packages/mocha-framework/src/index'),
    require.resolve('./packages/typescript/src/index'),
  ],
  dashboard: {
    reportType: 'full'
  },
  files: [
    '{src,test,src-generated}/**/*.ts',
    '!{src,test,src-generated}/**/*.d.ts',
    'schema/**/*.json',
    '*', // files directly in the package directory
    'typings/**/*.ts',
  ]
};

