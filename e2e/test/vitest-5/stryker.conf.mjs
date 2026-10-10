export default {
  testRunner: 'vitest',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  mutate: ['src/add.js'],
  reporters: ['json', 'clear-text'],
  thresholds: { break: 100 },
  plugins: [import.meta.resolve('@stryker-mutator/vitest-runner')],
};
