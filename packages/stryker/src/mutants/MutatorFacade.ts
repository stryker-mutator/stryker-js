import { File, MutatorDescriptor, StrykerOptions } from 'stryker-api/core';
import { Mutant, Mutator, MutatorFactory } from 'stryker-api/mutant';
import ES5Mutator from '../mutators/ES5Mutator';
import { tokens, commonTokens, PluginKind } from 'stryker-api/plugin';
import { PluginCreator, coreTokens } from '../di';
import { Logger } from 'stryker-api/logging';

MutatorFactory.instance().register('es5', ES5Mutator);

export class MutatorFacade implements Mutator {

  public static inject = tokens(commonTokens.options, coreTokens.pluginCreatorMutator, commonTokens.logger);
  constructor(
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator<PluginKind.Mutator>,
    private readonly log: Logger) {
  }

  public mutate(inputFiles: ReadonlyArray<File>): ReadonlyArray<Mutant> {
    const allMutants = this.pluginCreator.create(this.getMutatorName(this.options.mutator))
      .mutate(inputFiles);
    const includedMutants = this.removeExcludedMutants(allMutants);
    this.logMutantCount(includedMutants.length, allMutants.length);
    return includedMutants;
  }

  private removeExcludedMutants(mutants: ReadonlyArray<Mutant>): ReadonlyArray<Mutant> {
    if (typeof this.options.mutator === 'string') {
      return mutants;
    } else {
      const mutatorDescriptor = this.options.mutator as MutatorDescriptor;
      return mutants.filter(mutant => mutatorDescriptor.excludedMutations.indexOf(mutant.mutatorName) === -1);
    }
  }

  private getMutatorName(mutator: string | MutatorDescriptor) {
    if (typeof mutator === 'string') {
      return mutator;
    } else {
      return mutator.name;
    }
  }

  private logMutantCount(includedMutantCount: number, totalMutantCount: number) {
    let mutantCountMessage;
    if (includedMutantCount) {
      mutantCountMessage = `${includedMutantCount} Mutant(s) generated`;
    } else {
      mutantCountMessage = `It\'s a mutant-free world, nothing to test.`;
    }
    const numberExcluded = totalMutantCount - includedMutantCount;
    if (numberExcluded) {
      mutantCountMessage += ` (${numberExcluded} Mutant(s) excluded)`;
    }
    this.log.info(mutantCountMessage);
  }
}
