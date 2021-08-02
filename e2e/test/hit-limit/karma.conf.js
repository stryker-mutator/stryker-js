module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/*.js',
      'test/*.karma.spec.js'
    ],
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  })
}
