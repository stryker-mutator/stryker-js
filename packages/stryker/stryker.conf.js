module.exports = function (config) {
  config.set({
    files: [
      'test/helpers/**/*.js',
      'test/unit/**/*.js',
      { pattern: 'src/**/*.js', included: false, mutated: true },
      { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false },
      { pattern: 'node_modules/stryker-api/!(node_modules)/**/*.js', included: false, mutated: false }],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'event-recorder'],
    coverageAnalysis: 'perTest',
    logLevel: 'info',
    plugins: ['stryker-mocha-runner', 'stryker-mocha-framework']
  });
};