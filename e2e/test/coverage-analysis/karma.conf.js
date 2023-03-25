// Karma configuration
// Generated on Tue Nov 30 2021 09:57:14 GMT+0100 (Central European Standard Time)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['chai', 'jasmine'],
    files: [
      'src/**/*.js',
      'spec/**/*.js'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  })
}
