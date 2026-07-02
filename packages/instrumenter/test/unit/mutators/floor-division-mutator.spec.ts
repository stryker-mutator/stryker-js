import { expect } from 'chai';

import { floorDivisionMutator as sut } from '../../../src/mutators/floor-division-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "FloorDivision"', () => {
    expect(sut.name).eq('FloorDivision');
  });

  it('should mutate a % b to Math.floor(a / b)', () => {
    expectJSMutation(sut, 'a % b', 'Math.floor(a / b)');
  });

  it('should mutate Math.floor(a / b) to a % b', () => {
    expectJSMutation(sut, 'Math.floor(a / b)', 'a % b');
  });

  it('should mutate Math.trunc(a / b) to a % b', () => {
    expectJSMutation(sut, 'Math.trunc(a / b)', 'a % b');
  });

  it('should mutate complex operands', () => {
    expectJSMutation(sut, '(x + 1) % (y - 2)', 'Math.floor((x + 1) / (y - 2))');
  });

  it('should not mutate Math.floor with non-division argument', () => {
    expectJSMutation(sut, 'Math.floor(a)');
    expectJSMutation(sut, 'Math.floor(a + b)');
  });

  it('should not mutate Math.floor with multiple arguments', () => {
    expectJSMutation(sut, 'Math.floor(a, b)');
  });

  it('should not mutate Math.round(a / b)', () => {
    expectJSMutation(sut, 'Math.round(a / b)');
  });

  it('should not mutate computed member access Math["floor"](a / b)', () => {
    expectJSMutation(sut, 'Math["floor"](a / b)');
  });

  it('should mutate both calls in nested Math.floor(Math.floor(a / b) / c)', () => {
    expectJSMutation(
      sut,
      'Math.floor(Math.floor(a / b) / c)',
      'Math.floor(a / b) % c',
      'Math.floor(a % b / c)',
    );
  });
});
