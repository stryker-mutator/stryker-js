module.exports = {
  mutate: [
    'src/*.js'
  ],
  testRunner: 'mocha',
  coverageAnalysis: 'off',
  buildCommand: 'npm run build',
  timeoutMS: 60000,
  reporters: ['clear-text', 'html', 'event-recorder', 'progress'],
  concurrency: 1,
  logLevel: 'info',
  plugins: [
    '@stryker-mutator/mocha-runner'
  ]
};
