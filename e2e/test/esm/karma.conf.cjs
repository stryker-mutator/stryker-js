module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'vite'],
    files: [{ pattern: 'test/math.spec.js', type: 'module', watched: false, served: false }],
    reporters: ['progress'],
    colors: true,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    plugins: ['karma-chrome-launcher', 'karma-jasmine', 'karma-mocha', 'karma-chai', 'karma-vite'],
    vite: {
      config: {
        resolve: {
          alias: {
            '/base': '',
          },
        },
      },
    },
  });
};
