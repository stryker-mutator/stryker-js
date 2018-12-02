module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testFramework: 'mocha',
    coverageAnalysis: 'off',
    reporter: ['clear-text', 'event-recorder'],
    mutator: 'javascript',
    maxConcurrentTestRunners: 2,
    testRunner: {
      name: 'command',
      settings: {
        command: 'npm run mocha'
      }
    },
    symlinkNodeModules: false,
    fileLogLevel: 'info'
  });
};
