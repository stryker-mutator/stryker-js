import Stryker from  'stryker';

new Stryker(['sourceFiles: string[]'], ['otherFiles: string[]']).runMutationTest(() => console.log('done'));