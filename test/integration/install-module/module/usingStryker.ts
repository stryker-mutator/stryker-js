import Stryker from  'stryker';

new Stryker({ mutateFiles: [], allFiles: []} ).runMutationTest().then(() => console.log('done'));