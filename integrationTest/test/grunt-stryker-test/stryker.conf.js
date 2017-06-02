module.exports = function (config) {
  config.set({
    files: [
      {pattern: 'testResources/sampleProject/src/**/!(InfiniteAdd).js', mutated: true, included: true },
      'testResources/sampleProject/test/**/!(FailingAddSpec).js',
    ],
    testFramework: 'jasmine',
    testRunner: 'karma',
    logLevel: 'debug',
    maxConcurrentTestRunners: 2,
    port: 9234
  });
}