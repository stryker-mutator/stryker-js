import { expect } from 'chai';
import ConditionalExpressionMutator from '../../../src/mutator/ConditionalExpressionMutator';
import { expectMutation } from './mutatorAssertions';

describe('ConditionalExpressionMutator', () => {

  let sut: ConditionalExpressionMutator;

  beforeEach(() => {
    sut = new ConditionalExpressionMutator();
  });

  it('should have name "ConditionalExpression"', () => {
    expect(sut.name).eq('ConditionalExpression');
  });

  it('should replace conditional expressions', () => {
    expectMutation(sut, 'a < 3? b : c', 'false? b : c');
  });
});