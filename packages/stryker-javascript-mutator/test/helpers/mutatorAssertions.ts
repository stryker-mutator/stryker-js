import { expect } from 'chai';
import { File } from 'stryker-api/core';
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
  const sourceFile = new File('file.js', sourceText);
  const mutants = javaScriptMutator.mutate([sourceFile]);
  expect(mutants).lengthOf(expectedTexts.length);
  const actualMutantTexts = mutants.map(mutant => mutantToString(mutant, sourceText));
  expectedTexts.forEach(expected => expect(actualMutantTexts, `was: ${actualMutantTexts.join(',')}`).to.include(expected));
}

/**
 * Place the mutant in the sourceText and remove all new-line tokens and excess whitespace in the mutant replacement
 * @param mutant 
 * @param sourceText 
 */
function mutantToString(mutant: Mutant, sourceText: string) {
  return sourceText.substr(0, mutant.range[0]) +
  mutant.replacement.replace(/\s{2,}/g, ' ').replace(/\n/g, ' ') +
    sourceText.substr(mutant.range[1]);
}