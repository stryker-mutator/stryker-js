export default {
  packageManager: 'npm',
  testRunner: 'jest',
  tempDirName: 'stryker-tmp',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  reporters: ['json', 'clear-text', 'progress', 'html', 'event-recorder'],
  plugins: [import.meta.resolve('@stryker-mutator/jest-runner')],
};
