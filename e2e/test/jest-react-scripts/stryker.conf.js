module.exports = {
  testRunner: 'jest',
  reporters: ['json', 'html', 'progress', 'clear-text'],
  tempDirName: 'stryker-tmp',
  timeoutMS: 60000,
  mutate: ['src/{Alert,Badge,Breadcrumb}.js'],
  concurrency: 2,
  jest: {
    projectType: 'create-react-app',
    config: {
      testEnvironment: require.resolve('jest-environment-jsdom'),
    },
  },
  plugins: ['@stryker-mutator/jest-runner'],
};
