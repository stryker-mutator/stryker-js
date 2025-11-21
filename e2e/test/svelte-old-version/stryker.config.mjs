export default {
  reporters: ['html', 'json', 'progress'],
  testRunner: 'jest',
  concurrency: 2,
  testRunnerNodeArgs: ['--experimental-vm-modules'],
  timeoutMS: 60000,
  plugins: [import.meta.resolve('@stryker-mutator/jest-runner')],
};
