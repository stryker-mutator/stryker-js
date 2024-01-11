import { expect } from 'chai';

import { assignmentOperatorMutator as sut } from '../../../src/mutators/assignment-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const assignmentOperatorLevel: MutationLevel = {
  name: 'AssignmentOperatorLevel',
  AssignmentOperator: ['SubtractionAssignmentNegation', 'LeftShiftAssignmentNegation', 'LogicalAndAssignmentNegation'],
};
const assignmentOperatorUndefinedLevel: MutationLevel = { name: 'AssignmentOperatorLevel', AssignmentOperator: [] };
const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "AssignmentOperator"', () => {
    expect(sut.name).eq('AssignmentOperator');
  });

  it('should mutate += and -=', () => {
    expectJSMutation(sut, 'a += b', 'a -= b');
    expectJSMutation(sut, 'a -= b', 'a += b');
  });

  it('should mutate *=, %= and /=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate *=, %= and /=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate <<=, >>=, &= and |=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate &&=, ||= and ??=', () => {
    expectJSMutation(sut, 'a &&= b', 'a ||= b');
    expectJSMutation(sut, 'a ||= b', 'a &&= b');
    expectJSMutation(sut, 'a ??= b', 'a &&= b');
  });

  it('should not mutate a string literal unless it is &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a += "b"');
    expectJSMutation(sut, 'a -= "b"');
    expectJSMutation(sut, 'a *= "b"');
    expectJSMutation(sut, 'a /= "b"');
    expectJSMutation(sut, 'a %= "b"');
    expectJSMutation(sut, 'a <<= "b"');
    expectJSMutation(sut, 'a >>= "b"');
    expectJSMutation(sut, 'a &= "b"');
    expectJSMutation(sut, 'a |= "b"');
  });

  it('should mutate a string literal using &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a &&= "b"', 'a ||= "b"');
    expectJSMutation(sut, 'a ||= "b"', 'a &&= "b"');
    expectJSMutation(sut, 'a ??= "b"', 'a &&= "b"');
  });

  it('should not mutate string template unless it is &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a += `b`');
    expectJSMutation(sut, 'a -= `b`');
    expectJSMutation(sut, 'a *= `b`');
    expectJSMutation(sut, 'a /= `b`');
    expectJSMutation(sut, 'a %= `b`');
    expectJSMutation(sut, 'a <<= `b`');
    expectJSMutation(sut, 'a >>= `b`');
    expectJSMutation(sut, 'a &= `b`');
    expectJSMutation(sut, 'a |= `b`');
  });

  it('should mutate string template using &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a &&= `b`', 'a ||= `b`');
    expectJSMutation(sut, 'a ||= `b`', 'a &&= `b`');
    expectJSMutation(sut, 'a ??= `b`', 'a &&= `b`');
  });

  describe('mutation level', () => {
    it('should only mutate -=, <<, &&=', () => {
      expectJSMutationWithLevel(
        sut,
        assignmentOperatorLevel.AssignmentOperator,
        'a += b; a -= b; a *= b; a /= b; a <<= b; a &&= b;',
        'a += b; a += b; a *= b; a /= b; a <<= b; a &&= b;', // mutates -= to +=
        'a += b; a -= b; a *= b; a /= b; a >>= b; a &&= b;', // mutates <<= to >>=
        'a += b; a -= b; a *= b; a /= b; a <<= b; a ||= b;', // mutates &&= to ||=
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, assignmentOperatorUndefinedLevel.AssignmentOperator, 'a += b; a -= b; a *= b; a /= b; a <<= b; a &&= b;');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'a += b; a -= b; a *= b; a /= b; a <<= b; a &&= b;',
        'a -= b; a -= b; a *= b; a /= b; a <<= b; a &&= b;', // mutates += to -=
        'a += b; a += b; a *= b; a /= b; a <<= b; a &&= b;', // mutates -= to +=
        'a += b; a -= b; a /= b; a /= b; a <<= b; a &&= b;', // mutates *= to /=
        'a += b; a -= b; a *= b; a *= b; a <<= b; a &&= b;', // mutates /= to *=
        'a += b; a -= b; a *= b; a /= b; a >>= b; a &&= b;', // mutates <<= to >>=
        'a += b; a -= b; a *= b; a /= b; a <<= b; a ||= b;', // mutates &&= to ||=
      );
    });
  });
});
