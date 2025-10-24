module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'vite'],
    files: [
      {
        pattern: 'test/*.spec.js',
        type: 'module',
        watched: false,
        served: false,
      },
    ],
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    vite: { config: { resolve: { alias: { '/base': '' } } } },
    plugins: [
      require.resolve('karma-jasmine'),
      require.resolve('karma-chrome-launcher'),
      require.resolve('karma-vite'),
    ]
  });
};
