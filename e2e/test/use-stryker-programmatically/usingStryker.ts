import Stryker from '@stryker-mutator/core';

new Stryker({
  coverageAnalysis: 'off',
  mutate: [],
  testRunner: 'mocha'
}).runMutationTest().then(() => console.log('done'));
