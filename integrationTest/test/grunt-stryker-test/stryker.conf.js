module.exports = function (config) {
  config.set({
    files: [
      {pattern: 'sampleProject/src/**/!(InfiniteAdd).js', mutated: true, included: true },
      'sampleProject/test/**/!(FailingAddSpec).js',
    ],
    testFramework: 'jasmine',
    testRunner: 'karma',
    logLevel: 'info',
    maxConcurrentTestRunners: 2,
    port: 9234
  });
}