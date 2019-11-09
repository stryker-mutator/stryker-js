module.exports = function (config) {
  config.set({
    mutate: [
      'src/*.js'
    ],
    testFramework: 'mocha',
    testRunner: 'mocha',
    coverageAnalysis: 'off',
    mutator: { 
      name: 'javascript',
      plugins: [['pipelineOperator', { proposal: 'minimal' }]]
    },
    transpilers: [
      'babel'
    ],
    timeoutMS: 60000,
    reporters: ['clear-text', 'html', 'event-recorder'],
    maxConcurrentTestRunners: 2,
    logLevel: 'info'
  });
};
