module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js', 'src/**/*.vue'],
    mutator: 'vue',
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporter: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    port: 9264,
    karma: {
      configFile: 'test/unit/karma.conf.js'
    },
    coverageAnalysis: 'off'
  });
};
