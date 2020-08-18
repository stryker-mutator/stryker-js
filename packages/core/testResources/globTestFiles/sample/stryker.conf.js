module.exports = function (config) {
  config.set({
    files: [
      { pattern: 'testResources/sampleProject/src/*.js', mutated: true },
      'testResources/sampleProject/test/*.js',
      '!testResources/sampleProject/src/Error.js',
      '!testResources/sampleProject/src/InfiniteAdd.js',
      '!testResources/sampleProject/test/FailingAddSpec.js',],
    testRunner: 'karma',
    coverageAnalysis: 'off',
    plugins: ['stryker-karma-runner']
  });
};
