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
  maxConcurrentTestRunners: 4,
  plugins: [
    require.resolve('./packages/mocha-runner/src/index'),
    require.resolve('./packages/mocha-framework/src/index'),
    require.resolve('./packages/html-reporter/src/index'),
    require.resolve('./packages/typescript/src/index'),
  ],
  dashboard: {
    reportType: 'full'
  }
};

