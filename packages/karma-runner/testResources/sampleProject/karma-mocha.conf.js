

module.exports = function (config) {
  config.set({
    files: [
      __dirname + '/src/*.js',
      __dirname + '/test-mocha/*.js'
    ],
    exclude: [
      __dirname + '/src/Error.js',
      __dirname + '/src/InfiniteAdd.js'
    ],
    singleRun: false,
    watch: true,
    frameworks: [
      'mocha'
    ],
    browsers: [
      'ChromeHeadless'
    ]
  });
}
