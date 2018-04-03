import * as ts from 'typescript';
import { parseFile } from '../../../src/helpers/tsHelpers';
import { expect } from 'chai';
import { Mutant } from 'stryker-api/mutant';
import NodeMutator from '../../../src/mutator/NodeMutator';
import ExpectMutation from 'stryker-mutator-specification/src/ExpectMutation';
import { File } from 'stryker-api/core';

export interface MutatorConstructor {
  new(): NodeMutator;
}

export function verifySpecification(specification: (name: string, expectMutation: ExpectMutation) => void, MutatorClass: MutatorConstructor): void {
  specification(new MutatorClass().name, (actual: string, ...expected: string[]) => expectMutation(new MutatorClass(), actual, ...expected));
}

export function expectMutation(mutator: NodeMutator, sourceText: string, ...expectedTexts: string[]) {
  const tsFile = new File('file1.ts', sourceText);
  const sourceFile = parseFile(tsFile, undefined);
  const mutants = mutate(mutator, sourceFile, sourceFile);
  expect(mutants).lengthOf(expectedTexts.length);
  const actualMutantTexts = mutants
    .map(mutant => mutantToString(mutant, sourceText))
    .map(format);
  expectedTexts.forEach(expected => {
    expect(actualMutantTexts, `was: ${actualMutantTexts.join(',')}`).to.include(format(expected));
  });
}

function format(code: string) {
  const ast = parseFile(new File('file1.ts', code), undefined);
  return ts.createPrinter().printFile(ast);
}

function mutate(mutator: NodeMutator, node: ts.Node, sourceFile: ts.SourceFile): Mutant[] {
  const mutants: Mutant[] = [];
  if (mutator.guard(node)) {
    mutants.push(...mutator.mutate(node, sourceFile));
  }
  node.forEachChild(child => {
    mutants.push(...mutate(mutator, child, sourceFile));
  });
  return mutants;
}

function mutantToString(mutant: Mutant, sourceText: string) {
  return sourceText.substr(0, mutant.range[0]) +
    mutant.replacement +
    sourceText.substr(mutant.range[1]);
}
