module.exports = {
  testRunner: 'custom',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  fileLogLevel: 'trace',
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  plugins: [require.resolve('./custom-test-runner.mjs')]
};
