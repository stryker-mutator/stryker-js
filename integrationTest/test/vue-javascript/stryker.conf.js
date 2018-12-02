module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js', 'src/**/*.vue'],
    mutator: 'vue',
    testFramework: 'jasmine',
    testRunner: {
      name: 'karma',
      settings: {
        configFile: 'test/unit/karma.conf.js'
      }
    },
    reporter: ['clear-text', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    port: 9264,
    coverageAnalysis: 'off'
  })
}
