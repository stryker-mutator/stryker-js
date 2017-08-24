import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutant, MutantGenerator, MutantGeneratorFactory } from 'stryker-api/mutant';


class MyMutantGenerator implements MutantGenerator {
  public name = 'myMutator';
  generateMutants(inputFiles: File[]): Mutant[] {
    return [{
      fileName: 'file',
      range: [1, 2],
      mutatorName: 'foo',
      replacement: 'bar'
    }];
  } 
}

MutantGeneratorFactory.instance().register('myMutantGenerator', MyMutantGenerator);
let myMutator = MutantGeneratorFactory.instance().create('myMutantGenerator', new Config());
if (!(myMutator instanceof MyMutantGenerator)) {
  throw Error('Something wrong with myMutator');
}
console.log(myMutator.generateMutants([]));