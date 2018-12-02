module.exports = function (config) {
  config.set({
    mutate: [
      'sampleProject/src/**'
    ],
    testFramework: 'jasmine',
    testRunner: {
      name: 'karma',
      settings: {
        config: {
          files: ['sampleProject/**']
        }
      }
    },
    logLevel: 'info',
    maxConcurrentTestRunners: 2,
    port: 9234
  });
}