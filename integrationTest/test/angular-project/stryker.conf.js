module.exports = function (config) {
  config.set({
    mutate: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/test.ts',
      '!src/environments/*.ts'
    ],
    testRunner: 'karma',
    mutator: 'typescript',
    port: 9336,
    karma: {
      configFile: 'src/karma.conf.js',
      project: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    reporter: ['event-recorder'],
    coverageAnalysis: 'off',
    maxConcurrentTestRunners: 1
  });
};
