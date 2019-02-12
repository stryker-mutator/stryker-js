module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    coverageAnalysis: 'perTest',
    testFramework: 'jasmine',
    testRunner: 'jasmine',
    reporters: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 1,
    jasmineConfigFile: 'spec/support/jasmine.json',
    fileLogLevel: 'debug'
  });
};
