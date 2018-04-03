module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    mutator: 'javascript',
    testFramework: 'mocha',
    testRunner: 'karma',
    reporter: ['clear-text', 'html'],
    karmaConfig: {
      frameworks: ['mocha', 'chai'],
      files: ['src/*.js', 'test/*.js']
    },
    maxConcurrentTestRunners: 2,
    coverageAnalysis: 'perTest',
    port: 9264
  });
};
