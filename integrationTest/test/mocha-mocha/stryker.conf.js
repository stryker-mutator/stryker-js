module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    testRunner: {
      name: 'mocha',
      settings: {
        config: {
          files: ['test/*.js']
        }
      }
    },
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    port: 9264,
  });
};
