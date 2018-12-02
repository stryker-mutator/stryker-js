module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js'],
    transpilers: [
      'webpack'
    ],
    testFramework: 'jasmine',
    testRunner: {
      name: 'karma',
      settings: {
        config: {
          files: ['dist/main.js', 'test/*.js']
        }
      }
    },
    reporters: ['clear-text', 'html'],
    maxConcurrentTestRunners: 2,
    port: 9274,
    coverageAnalysis: 'off',
    mutator: 'javascript'
  });
};
