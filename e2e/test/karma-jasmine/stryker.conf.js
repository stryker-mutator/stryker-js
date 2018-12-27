module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporters: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    karmaConfig: {
      files: ['src/*.js', 'test/*.js']
    }
  });
};
