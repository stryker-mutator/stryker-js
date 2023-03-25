module.exports = function(config) {
  config.set({
    files: ['dist/main.js', 'test/*.js'],
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'ChromeHeadless'
    ]
  });
}


