import { File, MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';
import { commonTokens, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { coreTokens, PluginCreator } from '../di';

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
