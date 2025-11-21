export default {
  testRunner: 'vitest',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  mutate: [
    'packages/**/!(*.+(s|S)pec|*.+(t|T)est).+(cjs|mjs|js|ts|jsx|tsx|html|vue)',
    '!packages/**/vitest.*.js',
  ],
  plugins: [import.meta.resolve('@stryker-mutator/vitest-runner')],
};
