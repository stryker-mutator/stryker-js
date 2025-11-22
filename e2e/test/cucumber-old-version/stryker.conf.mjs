export default {
  testRunner: 'cucumber',
  plugins: [import.meta.resolve('@stryker-mutator/cucumber-runner')],
  concurrency: 1,
  timeoutMS: 20000,
  reporters: ['json', 'html'],
};
