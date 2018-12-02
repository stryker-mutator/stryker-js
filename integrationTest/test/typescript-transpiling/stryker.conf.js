module.exports = function (config) {
  config.set({
    tsconfigFile: 'tsconfig.json',
    mutate: ['src/*.ts'],
    testFramework: 'mocha',
    testRunner: {
      name: 'mocha',
      settings: {
        config: {
          files: ['test/**/*.js']
        }
      }
    },
    coverageAnalysis: 'off',
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    mutator: 'typescript',
    logLevel: 'info',
    transpilers: [
      'typescript'
    ],
    port: 9264
  });
};
