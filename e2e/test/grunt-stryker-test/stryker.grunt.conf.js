module.exports = {
  $schema:
    '../../node_modules/@stryker-mutator/core/schema/stryker-schema.json',
  mutate: ['sampleProject/src/**'],
  karma: {
    config: {
      files: ['sampleProject/**'],
      plugins: [require.resolve('karma-jasmine'), require.resolve('karma-chrome-launcher')],
    },
  },
  plugins: ['@stryker-mutator/karma-runner'],
  testRunner: 'karma',
  logLevel: 'info',
  fileLogLevel: 'warn',
  concurrency: 2,
};
