import { expect } from 'chai';

import { assignmentOperatorMutator as sut } from '../../../src/mutators/assignment-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

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
});
