import { File, MutatorDescriptor } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { Mutant, Mutator, MutatorFactory } from 'stryker-api/mutant';
import ES5Mutator from './mutators/ES5Mutator';

MutatorFactory.instance().register('es5', ES5Mutator);

export default class MutatorFacade implements Mutator {

  constructor(private config: Config) {
  }

  mutate(inputFiles: ReadonlyArray<File>): ReadonlyArray<Mutant> {
    return MutatorFactory.instance()
      .create(this.getMutatorName(this.config.mutator), this.config)
      .mutate(inputFiles);
  }

  private getMutatorName(mutator: string | MutatorDescriptor) {
    if (typeof mutator === 'string') {
      return mutator;
    } else {
      return mutator.name;
    }
  }
}