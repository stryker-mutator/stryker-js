module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    coverageAnalysis: 'off',
    reporter: ['clear-text', 'event-recorder'],
    mutator: 'javascript',
    maxConcurrentTestRunners: 2,
    commandRunner: {
      command: 'npm run mocha'
    },
    symlinkNodeModules: false,
    fileLogLevel: 'info'
  });
};
