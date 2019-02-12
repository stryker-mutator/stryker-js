module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js'],
    transpilers: [
      'webpack'
    ],
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporters: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    karma: {
      config: {
        files: ['dist/main.js', 'test/*.js']
      }
    },
    coverageAnalysis: 'off',
    mutator: 'javascript'
  });
};
