import { expect } from 'chai';
import { TextFile, FileKind } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import JavaScriptMutator from '../../src/JavaScriptMutator';
import NodeMutator from '../../src/mutators/NodeMutator';
import ExpectMutation from 'stryker-mutator-specification/src/ExpectMutation';

export interface MutatorConstructor {
  new(): NodeMutator;
}

export function verifySpecification(specification: (name: string, expectMutation: ExpectMutation) => void, MutatorClass: MutatorConstructor): void {
  specification(new MutatorClass().name, (actual: string, ...expected: string[]) => expectMutation(new MutatorClass(), actual, ...expected));
}

export function expectMutation(mutator: NodeMutator, sourceText: string, ...expectedTexts: string[]) {
  const javaScriptMutator = new JavaScriptMutator(new Config(), [mutator]);
  const sourceFile: TextFile = {
    content: sourceText,
    included: true,
    mutated: true,
    name: 'file.js',
    transpiled: true,
    kind: FileKind.Text
  };
  const mutants = javaScriptMutator.mutate([sourceFile]);
  expect(mutants).lengthOf(expectedTexts.length);
  const actualMutantTexts = mutants.map(mutant => mutantToString(mutant, sourceText));
  expectedTexts.forEach(expected => expect(actualMutantTexts, `was: ${actualMutantTexts.join(',')}`).to.include(expected));
}

function mutantToString(mutant: Mutant, sourceText: string) {
  return sourceText.substr(0, mutant.range[0]) +
    mutant.replacement +
    sourceText.substr(mutant.range[1]);
}