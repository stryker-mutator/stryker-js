module.exports = function (config) {
  config.set({
    files: [{ pattern: 'testResources/sampleProject/src/?(Circle|Add).js', mutated: true }, 'testResources/sampleProject/test/?(AddSpec|CircleSpec).js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    // testSelector: null,
    plugins: ['stryker-karma-runner']
  });
}