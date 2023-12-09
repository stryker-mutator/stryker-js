import { expect } from 'chai';

import { arrowFunctionMutator as sut } from '../../../src/mutators/arrow-function-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const arrowFunctionLevel: MutationLevel = { name: 'ArrowFunctionLevel', ArrowFunction: ['ArrowFunctionRemoval'] };
const arrowFunctionUndefinedLevel: MutationLevel = { name: 'ArrowFunctionLevel' };

describe(sut.name, () => {
  it('should have name "ArrowFunction"', () => {
    expect(sut.name).eq('ArrowFunction');
  });

  it('should mutate an anonymous function with an inline return', () => {
    expectJSMutation(sut, 'const b = () => 4;', 'const b = () => undefined;');
  });

  it('should not mutate an anonymous function with a block as a body', () => {
    expectJSMutation(sut, 'const b = () => { return 4; }');
  });

  it('should not mutate an anonymous function with undefined as a body', () => {
    expectJSMutation(sut, 'const b = () => undefined');
  });

  it('should only mutate what is defined in the mutator level', () => {
    expectJSMutationWithLevel(sut, arrowFunctionLevel.ArrowFunction, 'const b = () => 4;', 'const b = () => undefined;');
  });

  it('should not mutate anything if there are no values in the mutation level', () => {
    expectJSMutationWithLevel(sut, [], 'const b = () => 4;');
  });

  it('should mutate everything if the mutation level is undefined', () => {
    expectJSMutationWithLevel(sut, arrowFunctionUndefinedLevel.ArrowFunction, 'const b = () => 4;', 'const b = () => undefined;');
  });
});
