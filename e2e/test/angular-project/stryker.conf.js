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
    karma: {
      configFile: 'src/karma.conf.js',
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    reporters: ['event-recorder'],
    coverageAnalysis: 'off',
    concurrency: 1,
    timeoutMS: 60000
  });
};
