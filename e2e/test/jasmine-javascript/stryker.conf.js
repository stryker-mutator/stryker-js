module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    coverageAnalysis: 'perTest',
    testRunner: 'jasmine',
    reporters: ['clear-text', 'event-recorder'],
    concurrency: 2,
    jasmineConfigFile: 'spec/support/jasmine.json',
    fileLogLevel: 'debug',
    plugins: ['@stryker-mutator/jasmine-runner']
  });
};
