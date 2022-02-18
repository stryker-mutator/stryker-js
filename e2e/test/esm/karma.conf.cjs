module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      { pattern: 'src/*.js', type: 'module' },
      { pattern: 'test/math.spec.js', type: 'module' },
    ],
    reporters: ['progress'],
    colors: true,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
}
