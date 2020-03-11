module.exports = {
  mutate: [
    'src/*.js'
  ],
  testFramework: 'mocha',
  testRunner: 'mocha',
  coverageAnalysis: 'off',
  mutator: 'javascript',
  transpilers: [
    'babel'
  ],
  timeoutMS: 60000,
  reporters: ['clear-text', 'html', 'event-recorder'],
  maxConcurrentTestRunners: 2,
  logLevel: 'info',
  fileLogLevel: 'info'
}
