import Stryker from '@stryker-mutator/core';

new Stryker({
  testRunner: 'mocha',
  concurrency: 1
}).runMutationTest().then(() => console.log('done')).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
