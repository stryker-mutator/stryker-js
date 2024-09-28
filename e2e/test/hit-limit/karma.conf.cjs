module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'vite'],
    files: [{ pattern: 'test/*.spec.js', type: 'module', watched: false, served: false }],
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    vite: { config: { resolve: { alias: { '/base': '' } } } },
  });
};
