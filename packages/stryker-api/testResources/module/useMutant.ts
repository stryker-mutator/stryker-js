import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutant, Mutator, MutatorFactory } from 'stryker-api/mutant';

class MyMutator implements Mutator {
  public name = 'myMutator';
  public mutate(inputFiles: File[]): Mutant[] {
    return [{
      fileName: 'file',
      mutatorName: 'foo',
      range: [1, 2],
      replacement: 'bar'
    }];
  }
}

MutatorFactory.instance().register('myMutator', MyMutator);
const myMutator = MutatorFactory.instance().create('myMutator', new Config());
if (!(myMutator instanceof MyMutator)) {
  throw Error('Something wrong with myMutator');
}
console.log(myMutator.mutate([]));
