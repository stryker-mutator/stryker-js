import * as ts from 'typescript';
import { parseFile } from '../../../src/helpers/tsHelpers';
import { expect } from 'chai';
import { Mutant } from 'stryker-api/mutant';
import NodeMutator from '../../../src/mutator/NodeMutator';
import { textFile } from '../../helpers/producers';


export function expectMutation(mutator: NodeMutator) {
  return (sourceText: string, ...expectedTexts: string[]) => {
    const sourceFile = ts.createSourceFile('file.ts', sourceText, ts.ScriptTarget.ES5);
    const mutants = mutate(mutator, sourceFile, sourceFile);
    expect(mutants).lengthOf(expectedTexts.length);
    const actualMutantTexts = mutants.map(mutant => mutantToString(mutant, sourceText));
    expectedTexts.forEach(expected => expect(actualMutantTexts, `was: ${actualMutantTexts.join(',')}`).to.include(expected));
  };
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
