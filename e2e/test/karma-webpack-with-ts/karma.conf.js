const webpack = require('./webpack.dev');
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: ['test/unit/index.js'],
    preprocessors: {
      'test/unit/index.js': ['webpack', 'sourcemap'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    concurrency: Infinity,
    webpack,
    plugins: [
      require.resolve('karma-mocha'),
      require.resolve('karma-chrome-launcher'),
      require.resolve('karma-webpack'),
      require.resolve('karma-sourcemap-loader'),
    ],
  });

  // Delete regular entry/output. Karma's `files` will be used
  delete config.webpack.entry;
  delete config.webpack.output;
};
