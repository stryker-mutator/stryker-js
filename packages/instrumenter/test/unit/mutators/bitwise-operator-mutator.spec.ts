import { expect } from 'chai';

import { bitwiseOperatorMutator as sut } from '../../../src/mutators/bitwise-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "BitwiseOperator"', () => {
    expect(sut.name).eq('BitwiseOperator');
  });

  it('should mutate & and |', () => {
    expectJSMutation(sut, 'a & b', 'a | b');
    expectJSMutation(sut, 'a | b', 'a & b');
  });

  it('should mutate << and >>', () => {
    expectJSMutation(sut, 'a << b', 'a >> b');
    expectJSMutation(sut, 'a >> b', 'a << b');
  });

  it('should mutate ^ to &', () => {
    expectJSMutation(sut, 'a ^ b', 'a & b');
  });

  it('should mutate >>> to >>', () => {
    expectJSMutation(sut, 'a >>> b', 'a >> b');
  });

  it('should not mutate logical && and || operators', () => {
    expectJSMutation(sut, 'a && b');
    expectJSMutation(sut, 'a || b');
  });

  it('should mutate complex operands', () => {
    expectJSMutation(sut, '(x + 1) & (y - 2)', 'x + 1 | y - 2');
  });
});
