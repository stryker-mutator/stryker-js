module.exports = function (config) {
  config.set({
    mutate: [
      'sampleProject/src/**'
    ],
    karmaConfig: {
      files: ['sampleProject/**']
    },
    testFramework: 'jasmine',
    testRunner: 'karma',
    logLevel: 'info',
    maxConcurrentTestRunners: 2,
    port: 9234
  });
}