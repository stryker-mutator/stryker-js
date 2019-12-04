import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { commonTokens, Injector, OptionsContext, tokens } from '@stryker-mutator/api/plugin';
import * as ts from 'typescript';
import { forEachComment } from 'tsutils';

import flatMap = require('lodash.flatmap');

import { getTSConfig, parseFile } from './helpers/tsHelpers';
import { nodeMutators } from './mutator';
import NodeMutator from './mutator/NodeMutator';

export function typescriptMutatorFactory(injector: Injector<OptionsContext>): TypescriptMutator {
  return injector.provideValue(MUTATORS_TOKEN, nodeMutators).injectClass(TypescriptMutator);
}
typescriptMutatorFactory.inject = tokens(commonTokens.injector);

export const MUTATORS_TOKEN = 'mutators';
export class TypescriptMutator {
  private disableMutations: boolean = false;
  private readonly excludedExpressions: string[];

  public static inject = tokens(commonTokens.options, MUTATORS_TOKEN);
  constructor(private readonly options: StrykerOptions, public readonly mutators: readonly NodeMutator[]) {
    if (typeof this.options.mutator !== 'string') {
      this.excludedExpressions = this.options.mutator.excludedExpressions || [];
    } else {
      this.excludedExpressions = [];
    }
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const tsConfig = getTSConfig(this.options);
    const mutants = flatMap(inputFiles, inputFile => {
      const sourceFile = parseFile(inputFile, tsConfig && tsConfig.options && tsConfig.options.target);
      return this.mutateForNode(sourceFile, sourceFile);
    });
    return mutants;
  }

  private mutatorsSwitcher(comment: string) {
    switch (comment.trim()) {
      case 'stryker:on':
        this.disableMutations = false;
        break;
      case 'stryker:off':
        this.disableMutations = true;
        break;
    }
  }

  private mutateForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    forEachComment(node, (c, com) => {
      this.mutatorsSwitcher(sourceFile.getFullText().substring(com.pos, com.end));
    });

    let exclude = false;

    if (this.excludedExpressions.length > 0) {
      const nodeFirstLine = getNodeFirstLine(node, sourceFile);
      exclude = this.excludedExpressions.some(bl => nodeFirstLine.includes(bl));
    }

    const isNodeSkipped = shouldNodeBeSkipped(node);

    if (node.kind !== ts.SyntaxKind.SourceFile && (exclude || this.disableMutations || isNodeSkipped)) {
      return [];
    }

    const targetMutators = !exclude && !this.disableMutations && !isNodeSkipped ? this.mutators.filter(mutator => mutator.guard(node)) : [];
    const mutants = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(...this.mutateForNode(child, sourceFile));
    });
    return mutants;
  }
}

const shouldNodeBeSkipped = (node: ts.Node): boolean => {
  return (
    node.kind === ts.SyntaxKind.InterfaceDeclaration ||
    (node.modifiers !== undefined && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword))
  );
};

const getNodeFirstLine = (node: ts.Node, sourceFile: ts.SourceFile) => {
  const nodeText = sourceFile.text.substring(node.pos, node.end);
  return nodeText.split('\n').filter(l => l && l.trim())[0] || '';
};
