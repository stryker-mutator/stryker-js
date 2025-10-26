module.exports = {
  mutate: ['src/*.js'],
  testRunner: 'karma',
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  karma: {
    config: {
      frameworks: ['mocha', 'vite'],
      files: [
        { pattern: 'test/*.js', served: false, watched: false, type: 'module' },
      ],
      plugins: [
        require.resolve('karma-mocha'),
        require.resolve('karma-chrome-launcher'),
        require.resolve('karma-vite'),
      ],
    },
  },
  timeoutMS: 120000,
  concurrency: 2,
  coverageAnalysis: 'perTest',
  plugins: ['@stryker-mutator/karma-runner'],
};
