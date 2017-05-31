module.exports = function (config) {
  config.set({
    files: ['src/*.js', 'test/*.js'],
    mutate: ['src/*.js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporter: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    port: 9254
  });
};
