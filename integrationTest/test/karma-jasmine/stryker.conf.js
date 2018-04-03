module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporter: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    port: 9254,
    karmaConfig: {
      files: ['src/*.js', 'test/*.js']
    }
  });
};
