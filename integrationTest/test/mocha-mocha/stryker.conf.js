module.exports = function (config) {
  config.set({
    files: ['src/*.js', 'test/*.js'],
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    port: 9264
  });
};