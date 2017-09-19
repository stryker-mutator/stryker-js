import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { Mutant, Mutator, MutatorFactory } from 'stryker-api/mutant';
import ES5Mutator from './mutators/ES5Mutator';

MutatorFactory.instance().register('es5', ES5Mutator);

export default class MutatorFacade implements Mutator {

  constructor(private config: Config) {
  }

  mutate(inputFiles: File[]): Mutant[] {
    return MutatorFactory.instance()
      .create(this.config.mutator, this.config)
      .mutate(inputFiles);
  }
}