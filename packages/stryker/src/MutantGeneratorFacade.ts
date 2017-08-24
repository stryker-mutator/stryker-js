import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { Mutant, MutantGenerator, MutantGeneratorFactory } from 'stryker-api/mutant';
import ES5MutantGenerator from './mutators/ES5MutantGenerator';

MutantGeneratorFactory.instance().register('es5', ES5MutantGenerator);

export default class MutantGeneratorFacade implements MutantGenerator {

  constructor(private config: Config) {
  }

  generateMutants(inputFiles: File[]): Mutant[] {
    return MutantGeneratorFactory.instance()
      .create(this.config.mutantGenerator, this.config)
      .generateMutants(inputFiles);
  }
}