

module.exports = function (config) {
  config.set({
    files: [
      __dirname + '/src/Add.js',
      __dirname + '/test/AddSpec.js',
      'f.js'
    ],
    exclude: [
      __dirname + '/src/Error.js',
      __dirname + '/src/InfiniteAdd.js'
    ],
    singleRun: false,
    watch: true,
    frameworks: [
      'jasmine'
    ],
    client: {
      jasmine: {
        random: false,
        stopOnFailure: true,
        failFast: true
      }
    },
    browsers: [
      'Chrome'
    ]
  });
}