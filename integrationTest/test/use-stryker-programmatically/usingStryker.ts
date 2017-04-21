import Stryker from  'stryker';

new Stryker({ mutateFiles: [], allFiles: [], coverageAnalysis: 'off'} ).runMutationTest().then(() => console.log('done'));