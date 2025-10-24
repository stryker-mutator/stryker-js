const { config } = require("process");

module.exports = {
  packageManager: 'npm',
  testRunner: 'jest',
  tempDirName: 'stryker-tmp',
  mutate: ['src/App/TodoList/Item/index.tsx', 'src/NotFound.tsx'],
  timeoutMS: 40000,
  concurrency: 2,
  coverageAnalysis: 'perTest',
  reporters: ['json', 'progress', 'clear-text', 'html'],
  jest: { projectType: 'create-react-app', config: { testEnvironment: require.resolve('jest-environment-jsdom') } },
  plugins: ['@stryker-mutator/jest-runner'],
};
