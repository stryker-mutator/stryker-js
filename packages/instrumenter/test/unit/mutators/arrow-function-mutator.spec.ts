import { expect } from 'chai';

import { arrowFunctionMutator as sut } from '../../../src/mutators/arrow-function-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const arrowFunctionLevel: MutationLevel = { name: 'ArrowFunctionLevel', ArrowFunction: ['ArrowFunctionRemoval'] };
const arrowFunctionOperatorUndefinedLevel: MutationLevel = { name: 'ArrowFunctionLevel', ArrowFunction: [] };
const noLevel = undefined;

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

  describe('mutation level', () => {
    it('should remove ArrowFunction', () => {
      expectJSMutationWithLevel(sut, arrowFunctionLevel.ArrowFunction, 'const b = () => 4;', 'const b = () => undefined;'); // ArrowFunctionRemoval
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, arrowFunctionOperatorUndefinedLevel.ArrowFunction, 'const b = () => 4;');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, noLevel, 'const b = () => 4;', 'const b = () => undefined;');
    });
  });
});
