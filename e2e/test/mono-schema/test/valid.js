/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  checkers: ['typescript'],
  testRunner: 'mocha',
  jest: {
    config: {},
  },
  jasmineConfigFile: 'A file',
  karma: {
    ngConfig: {
      testArguments: { test: 'test' },
    },
  },
  cucumber: {
    features: ['my-feature.feature'],
    profile: 'stryker',
    tags: ['@tag', '@tag2'],
  },
  vitest: {
    configFile: 'vitest.config.js',
  },
  tap: {
    testFiles: ['{**/@(test|tests|__test__|__tests__)/**,**/*.@(test|tests|spec)}.@(cjs|mjs|js|jsx|ts|tsx)'],
    nodeArgs: ['--loader', 'ts-node/esm'],
  },
};
export default config;
