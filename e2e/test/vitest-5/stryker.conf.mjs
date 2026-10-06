export default {
  testRunner: 'vitest',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  plugins: [import.meta.resolve('@stryker-mutator/vitest-runner')],
};
