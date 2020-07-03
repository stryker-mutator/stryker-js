module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    coverageAnalysis: 'perTest',
    testFramework: 'jasmine',
    testRunner: 'jasmine',
    reporters: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    jasmineConfigFile: 'spec/support/jasmine.json',
    fileLogLevel: 'debug',
    plugins: ['@stryker-mutator/jasmine-runner']
  });
};
