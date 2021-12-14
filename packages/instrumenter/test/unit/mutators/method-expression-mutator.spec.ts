import { expect } from 'chai';

import { methodExpressionsMutator as sut } from '../../../src/mutators/method-expression-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(sut.name, () => {
  it('should have name "MethodExpression"', () => {
    expect(sut.name).eq('MethodExpression');
  });

  it('should mutate forEach and map', () => {
    expectJSMutation(sut, 'a.forEach()', 'a.map()');
    expectJSMutation(sut, 'a.map()', 'a.forEach()');
  });

  it('should mutate filter and reduce', () => {
    expectJSMutation(sut, 'a.filter()', 'a.reduce()');
    expectJSMutation(sut, 'a.reduce()', 'a.filter()');
  });

  it('should mutate some and every', () => {
    expectJSMutation(sut, 'a.some()', 'a.every()');
    expectJSMutation(sut, 'a.every()', 'a.some()');
  });

  it('should mutate from and assign', () => {
    expectJSMutation(sut, 'a.from()', 'a.assign()');
    expectJSMutation(sut, 'a.assign()', 'a.from()');
  });

  it('should mutate slice and split', () => {
    expectJSMutation(sut, 'a.slice()', 'a.split()');
    expectJSMutation(sut, 'a.split()', 'a.slice()');
  });
});
