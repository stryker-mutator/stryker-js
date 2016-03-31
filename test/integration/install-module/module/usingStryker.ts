import Stryker from  'stryker';

new Stryker(['mutateFiles: string[]'], ['allFiles: string[]']).runMutationTest().then(() => console.log('done'));