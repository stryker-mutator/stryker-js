

module.exports = function (config) {
  config.set({
    files: [__dirname + '/src/*.js', __dirname + '/test/jasmine/*.js'],
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadless'],
    plugins: [require.resolve('karma-chrome-launcher'), require.resolve('karma-jasmine')],
  });
}
