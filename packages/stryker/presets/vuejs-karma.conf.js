module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue'],
    mutator: 'vue',
    testRunner: 'karma',
    karma: {
      configFile: 'test/unit/karma.conf.js',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    reporter: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off'
  });
};