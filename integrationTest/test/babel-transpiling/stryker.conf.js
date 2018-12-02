module.exports = function (config) {
  config.set({
    mutate: [
      'src/*.js'
    ],
    testFramework: 'mocha',
    testRunner: {
      name: 'mocha',
    },
    coverageAnalysis: 'off',
    mutator: 'javascript',
    transpilers: [
      'babel'
    ],
    babelrcFile: '.babelrc',
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    logLevel: 'info'
  });
};
