import Stryker from '@stryker-mutator/core';

new Stryker({
  coverageAnalysis: 'off',
  files: [],
  mutate: [],
  testRunner: 'mocha'
}).runMutationTest().then(() => console.log('done'));
