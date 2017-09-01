module.exports = function (config) {
  config.set({
    tsconfigFile: 'tsconfig.json',
    mutate: ['src/*.ts'],
    testFramework: 'mocha',
    testRunner: 'mocha',
    coverageAnalysis: 'off',
    reporter: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    mutantGenerator: 'typescript',
    logLevel: 'info',
    transpilers: [
      'typescript'
    ],
    port: 9264
  });
};
