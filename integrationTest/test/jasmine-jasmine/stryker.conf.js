module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    coverageAnalysis: 'perTest',
    testFramework: 'jasmine',
    testRunner: 'jasmine',
    reporter: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    jasmineConfigFile: 'spec/support/jasmine.json'
  });
};
