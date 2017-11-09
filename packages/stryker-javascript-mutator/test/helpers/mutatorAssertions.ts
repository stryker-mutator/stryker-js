import JavaScriptMutator from '../../src/JavaScriptMutator';
import { TextFile, FileKind } from 'stryker-api/core';
import { expect } from 'chai';
import { Mutant } from 'stryker-api/mutant';

export function expectMutation(mutator: JavaScriptMutator, sourceText: string, ...expectedTexts: string[]) {
  const sourceFile: TextFile = {
    content: sourceText,
    included: true,
    mutated: true,
    name: 'file.js',
    transpiled: true,
    kind: FileKind.Text
  };
  const mutants = mutator.mutate([sourceFile]);
  expect(mutants).lengthOf(expectedTexts.length);
  const actualMutantTexts = mutants.map(mutant => mutantToString(mutant, sourceText));
  expectedTexts.forEach(expected => expect(actualMutantTexts, `was: ${actualMutantTexts.join(',')}`).to.include(expected));
}

function mutantToString(mutant: Mutant, sourceText: string) {
  return sourceText.substr(0, mutant.range[0]) +
    mutant.replacement +
    sourceText.substr(mutant.range[1]);
}