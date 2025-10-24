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
    plugins: [
      require.resolve('karma-chrome-launcher'),
      require.resolve('karma-jasmine'),
      require.resolve('karma-mocha'),
      require.resolve('karma-chai'),
      require.resolve('karma-vite'),
    ],
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
