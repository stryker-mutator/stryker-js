

module.exports = function (config) {
  config.set({
    files: [
      __dirname + '/src/*.js',
      __dirname + '/test-jasmine/*.js'
    ],
    exclude: [
      __dirname + '/src/Error.js',
      __dirname + '/src/InfiniteAdd.js',
      __dirname + '/test-jasmine/AddFailedSpec.js'
    ],
    singleRun: false,
    watch: true,
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'ChromeHeadless'
    ]
  });
}
