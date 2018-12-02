module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    mutator: 'javascript',
    testFramework: 'mocha',
    testRunner: {
      name: 'karma',
      settings: {
        config: {
          frameworks: ['mocha', 'chai'],
          files: ['src/*.js', 'test/*.js']
        }
      }
    },
    reporters: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    coverageAnalysis: 'perTest',
    port: 9264
  });
};
