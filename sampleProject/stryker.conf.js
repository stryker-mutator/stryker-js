module.exports = function (config) {
  config.set({
    files: [
      { pattern: 'src/*.js', mutated: true },
      'test/*.js',
      '!src/Error.js',
      '!src/InfiniteAdd.js',
      '!test/FailingAddSpec.js',],
    testFramework: 'jasmine',
    testRunner: 'karma',
    coverageAnalysis: 'off',
    plugins: ['stryker-karma-runner']
  });
};