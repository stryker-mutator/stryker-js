import Stryker from 'stryker';

new Stryker({
  coverageAnalysis: 'off',
  files: [],
  mutate: [],
  testRunner: 'mocha'
}).runMutationTest().then(() => console.log('done'));
