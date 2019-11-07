module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js', 'src/**/*.vue'],
    mutator: 'vue',
    testFramework: 'jasmine',
    testRunner: 'karma',
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    karma: {
      configFile: 'test/karma.conf.js'
    },
    coverageAnalysis: 'off'
  });
};
