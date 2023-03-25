module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/*.js',
      'test/math.spec.js'
    ],
    reporters: ['progress'],
    colors: true,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
}
