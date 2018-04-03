import Stryker from 'stryker';

new Stryker({
  testRunner: 'mocha',
  mutate: [],
  coverageAnalysis: 'off',
  files: []
}).runMutationTest().then(() => console.log('done'));