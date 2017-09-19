import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';
import ArrayNewExpressionMutator from '../../../src/mutator/ArrayNewExpressionMutator';


describe('ArrayNewExpressionMutator', () => {
  let sut: ArrayNewExpressionMutator;

  beforeEach(() => {
    sut = new ArrayNewExpressionMutator();
  });

  it('should have name "ArrayNewExpression"', () => {
    expect(sut.name).eq('ArrayNewExpression');
  });

  it('should mutate filled array literals as empty arrays', () => {
    expectMutation(sut, 'new Array(a, 1 + 1)', 'new Array()');
    expectMutation(sut, `new Array('val')`, 'new Array()');
  });

  it('should not mutate array literals (leave that for ArrayLiteralMutator)', () => {
    expectMutation(sut, `[]`);
    expectMutation(sut, `[1, 2 ,3]`);
  });

  it('should not mutate other new expressions', () => {
    expectMutation(sut, 'new Object(21, 2)');
    expectMutation(sut, 'new Arrays(21, 2)');
  });

  it('should mutate empty array literals as a filled array', () => {
    expectMutation(sut, 'new Array()', 'new Array([])');
  });
});