module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['src/*.js', 'test/*.js'],
    browsers: ['ChromeHeadless'],
    listenAddress: '::',
    plugins: [
      require.resolve('karma-chai'),
      require.resolve('karma-mocha'),
      require.resolve('karma-chrome-launcher'),
    ],
  });
};
