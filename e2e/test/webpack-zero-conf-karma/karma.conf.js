module.exports = function(config) {
  config.set({
    files: ['dist/main.js', 'test/*.js'],
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'ChromeHeadless'
    ],
    plugins: [
      require.resolve('karma-jasmine'),
      require.resolve('karma-chrome-launcher')
    ]
  });
}


