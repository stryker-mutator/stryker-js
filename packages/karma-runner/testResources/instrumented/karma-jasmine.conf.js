

module.exports = function (config) {
  config.set({
    files: [
      __dirname + '/src/*.js',
      __dirname + '/test/jasmine/*.js'
    ],
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'ChromeHeadless'
    ]
  });
}
