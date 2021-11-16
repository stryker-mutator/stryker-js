import Stryker from '@stryker-mutator/core';

new Stryker({
  testRunner: 'mocha',
  concurrency: 1
}).runMutationTest().then(() => console.log('done'));
