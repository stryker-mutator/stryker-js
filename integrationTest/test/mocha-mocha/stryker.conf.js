module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    port: 9264,
    mochaOptions: {
      files: ['test/*.js']
    },
  });
};
