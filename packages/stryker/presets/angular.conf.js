module.exports = function (config) {
  config.set({
    mutate: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/test.ts',
      '!src/environments/*.ts'
    ],
    mutator: 'typescript',
    testRunner: 'karma',
    karma: {
      configFile: 'src/karma.conf.js',
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    reporters: ['progress', 'clear-text', 'html'],
    // maxConcurrentTestRunners: 2, // Recommended to not use all cores when running stryker with angular.
    coverageAnalysis: 'off'
  });
};