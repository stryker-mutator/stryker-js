module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'vite'],
    files: [
      { pattern: 'src/**/*.js', type: 'module', served: false, watch: false },
      { pattern: 'spec/**/*.js', type: 'module', served: false, watch: false },
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
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
