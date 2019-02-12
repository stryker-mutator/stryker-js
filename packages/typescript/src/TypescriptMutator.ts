import * as ts from 'typescript';
import flatMap = require('lodash.flatmap');
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { parseFile, getTSConfig } from './helpers/tsHelpers';
import NodeMutator from './mutator/NodeMutator';
import { commonTokens, tokens, Injector, OptionsContext } from '@stryker-mutator/api/plugin';
import { nodeMutators } from './mutator';

export function typescriptMutatorFactory(injector: Injector<OptionsContext>): TypescriptMutator {
  return injector
    .provideValue(MUTATORS_TOKEN, nodeMutators)
    .injectClass(TypescriptMutator);
}
typescriptMutatorFactory.inject = tokens(commonTokens.injector);

export const MUTATORS_TOKEN = 'mutators';
export class TypescriptMutator {

  public static inject = tokens(commonTokens.options, MUTATORS_TOKEN);
  constructor(private readonly options: StrykerOptions, public mutators: ReadonlyArray<NodeMutator>) { }

  public mutate(inputFiles: File[]): Mutant[] {
    const tsConfig = getTSConfig(this.options);
    const mutants = flatMap(inputFiles, inputFile => {
      const sourceFile = parseFile(inputFile, tsConfig && tsConfig.options && tsConfig.options.target);
      return this.mutateForNode(sourceFile, sourceFile);
    });
    return mutants;
  }

  private mutateForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const mutants = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(... this.mutateForNode(child, sourceFile));
    });
    return mutants;
  }
}
