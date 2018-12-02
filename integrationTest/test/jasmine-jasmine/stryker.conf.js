const { LogLevel } = require('stryker-api/core');
module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    coverageAnalysis: 'perTest',
    testFramework: 'jasmine',
    testRunner: {
      name: 'jasmine',
      settings: {
        configFile: 'spec/support/jasmine.json',
      }
    },
    reporters: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 1,
    fileLogLevel: LogLevel.Debug
  });
};
