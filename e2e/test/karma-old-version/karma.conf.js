module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['src/*.js', 'test/*.js'],
    browsers: ['ChromeHeadless']
  });
};
