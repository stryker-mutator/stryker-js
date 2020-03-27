import { File } from '@stryker-mutator/api/core';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';

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

console.log(new MyMutator().mutate([]));
