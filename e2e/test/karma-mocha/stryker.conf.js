module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    mutator: 'javascript',
    testFramework: 'mocha',
    testRunner: 'karma',
    reporters: ['clear-text', 'html', 'event-recorder'],
    karma: {
      config: {
        frameworks: ['mocha', 'chai'],
        files: ['src/*.js', 'test/*.js']
      }
    },
    maxConcurrentTestRunners: 2,
    coverageAnalysis: 'perTest'
  });
};
