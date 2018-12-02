module.exports = function (config) {
  config.set({
    mutate: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/test.ts',
      '!src/environments/*.ts'
    ],
    testRunner: {
      name: 'karma',
      settings: {
        configFile: 'src/karma.conf.js',
        projectType: 'angular-cli',
        config: {
          browsers: ['ChromeHeadless']
        }
      }
    },
    mutator: 'typescript',
    port: 9336,
    reporters: ['event-recorder'],
    coverageAnalysis: 'off',
    maxConcurrentTestRunners: 1
  });
};
