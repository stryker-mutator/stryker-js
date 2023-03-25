

module.exports = function (config) {
  config.set({
    files: [
      __dirname + '/src/*.js',
      __dirname + '/test/mocha/*.js'
    ],
    frameworks: [
      'chai',
      'mocha'
    ],
    browsers: [
      'ChromeHeadless'
    ]
  });
}
