import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { JavaScriptMutator } from '../../src/JavaScriptMutator';
import { NodeMutator } from '../../src/mutators/NodeMutator';
import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';

type MutatorConstructor = new() => NodeMutator;

export function verifySpecification(specification: (name: string, expectMutation: ExpectMutation) => void, mutatorClass: MutatorConstructor): void {
  specification(new mutatorClass().name, (actual: string, ...expected: string[]) => expectMutation(new mutatorClass(), actual, ...expected));
}

export function expectMutation(mutator: NodeMutator, sourceText: string, ...expectedTexts: string[]) {
  const javaScriptMutator = new JavaScriptMutator(TEST_INJECTOR.logger, [mutator]);
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
