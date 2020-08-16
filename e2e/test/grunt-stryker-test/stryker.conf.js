module.exports = function (config) {
  config.set({
    mutate: [
      'sampleProject/src/**'
    ],
    karma: {
      config: {
        files: ['sampleProject/**']
      }
    },
    testFramework: 'jasmine',
    testRunner: 'karma',
    logLevel: 'info',
    concurrency: 2
  });
}
