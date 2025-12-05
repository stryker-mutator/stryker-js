export default {
  testRunner: 'tap',
  concurrency: 1,
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  plugins: [import.meta.resolve('@stryker-mutator/tap-runner')],
};
