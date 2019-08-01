import * as ts from 'typescript';
import flatMap = require('lodash.flatmap');
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { parseFile, getTSConfig } from './helpers/tsHelpers';
import NodeMutator from './mutator/NodeMutator';
import { commonTokens, tokens, Injector, OptionsContext } from '@stryker-mutator/api/plugin';
import { nodeMutators } from './mutator';
import { forEachComment } from 'tsutils';

export function typescriptMutatorFactory(injector: Injector<OptionsContext>): TypescriptMutator {
  return injector
    .provideValue(MUTATORS_TOKEN, nodeMutators)
    .injectClass(TypescriptMutator);
}
typescriptMutatorFactory.inject = tokens(commonTokens.injector);

export const MUTATORS_TOKEN = 'mutators';
export class TypescriptMutator {

  public mutators: ReadonlyArray<NodeMutator>;
  private readonly mutatorsSwitch: { [key: string]: boolean };
  private nextMutation = -1 | 0 | 1;

  public static inject = tokens(commonTokens.options, MUTATORS_TOKEN);

  constructor(private readonly options: StrykerOptions, mutators: ReadonlyArray<NodeMutator>) {
    this.mutators = mutators;
    this.nextMutation = 0;
    this.mutatorsSwitch = {};
    mutators.forEach(mutator => {
      this.mutatorsSwitch[mutator.name] = true;
    });
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const tsConfig = getTSConfig(this.options);
    const mutants = flatMap(inputFiles, inputFile => {
      const sourceFile = parseFile(inputFile, tsConfig && tsConfig.options && tsConfig.options.target);
      return this.mutateForNode(sourceFile, sourceFile);
    });
    return mutants;
  }

  private parseSwitchers(data: string) {
    return data.split(',').map(el => el.trim()).filter(el => el !== '');
  }

  private updateMutators(data: string[], newValue: boolean) {
    if (data.length === 0) {
      Object.keys(this.mutatorsSwitch).forEach(mutator => {
        this.mutatorsSwitch[mutator] = newValue;
      });
    } else {
      data.forEach(mutator => {
        if (this.mutatorsSwitch[mutator] === !newValue) {
          this.mutatorsSwitch[mutator] = newValue;
        }
      });
    }
  }

  private mutatorsSwitcher(comment: string) {
    const regexp = /\/[/*]\s*stryker:(next-)?(on|off)((?:\s\w+,\s?)*(?:\s\w+)?)\s*(?:$|\*\/)/;
    const ex = regexp.exec(comment);
    if (ex === null) {
      return;
    }
    if ( ex[1] === 'next-') {
      this.nextMutation = ex[2] === 'on' ? 1 : -1;
    } else {
      if (ex[2] === 'on') {
        this.updateMutators(this.parseSwitchers(ex[3]), true);
      } else {
        this.updateMutators(this.parseSwitchers(ex[3]), false);
      }
    }
  }

  private mutateForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    if (shouldNodeBeSkipped(node)) {
      return [];
    } else {
      forEachComment(node, (c, com) => {
        this.mutatorsSwitcher(sourceFile.getFullText().substring(com.pos, com.end));
      });
      const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
      const mutants = flatMap(targetMutators, mutator => {
        if (this.mutatorsSwitch[mutator.name] || this.nextMutation === 1) {
          const mutatedNodes = mutator.mutate(node, sourceFile);

          if (mutatedNodes.length > 0) {
            if (this.nextMutation !== -1) {
              this.nextMutation = 0;
              return mutatedNodes;
            }
            this.nextMutation = 0;
            return [];
          }
          return [];
        }
        return [];
      });

      node.forEachChild(child => {
        // It is important that forEachChild does not return a true, otherwise node visiting is halted!
        mutants.push(...this.mutateForNode(child, sourceFile));
      });
      return mutants;
    }
  }
}

const shouldNodeBeSkipped = (node: ts.Node): boolean => {
  return node.modifiers !== undefined && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword);
};
