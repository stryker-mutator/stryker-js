module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    karma: {
      config: {
        files: ['src/*.js', 'test/*.js'],
        client: {
          clearContext: false
        }
      }
    },
    timeoutMS: 60000,
    mutator: 'javascript'
  });
};
