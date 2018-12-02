module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'jasmine',
    testRunner: {
      name: 'karma',
      settings: {
        config: {
          files: ['src/*.js', 'test/*.js']
        }
      }
    },
    reporters: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    port: 9254,
  });
};
