module.exports = function (config) {
  config.set({
    files: ['src/*.js', 'test/*.js'],
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    testRunner: 'karma',
    reporter: ['clear-text', 'html'],
    karmaConfig: {
      frameworks: ['mocha', 'chai']
    },
    maxConcurrentTestRunners: 2,
    coverageAnalysis: 'perTest',
    port: 9254
  });
};
