import { File, MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';
import { tokens, COMMON_TOKENS, PluginKind } from '@stryker-mutator/api/plugin';
import { PluginCreator, coreTokens } from '../di';
import { Logger } from '@stryker-mutator/api/logging';

export class MutatorFacade implements Mutator {

  public static inject = tokens(COMMON_TOKENS.options, coreTokens.PluginCreatorMutator, COMMON_TOKENS.logger);
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
