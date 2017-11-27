module.exports = function (config) {
  config.set({
    files: [
      { pattern: "src/*.js", mutated: true, included: false, transpiled: true },
      'test/*.js'
    ],
    testFramework: 'mocha',
    testRunner: 'mocha',
    coverageAnalysis: 'off',
    mutator: 'javascript',
    transpilers: [
      'babel'
    ],
    babelrcFile: '.babelrc',
    reporter: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    logLevel: 'info'
  });
};
