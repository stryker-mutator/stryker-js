const { LogLevel } = require('stryker-api/core');
module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    coverageAnalysis: 'perTest',
    testFramework: 'jasmine',
    testRunner: 'jasmine',
    reporter: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 1,
    jasmineConfigFile: 'spec/support/jasmine.json',
    fileLogLevel: LogLevel.Debug
  });
};
