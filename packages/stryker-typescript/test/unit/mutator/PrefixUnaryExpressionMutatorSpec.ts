import { expect } from 'chai';
import PrefixUnaryExpressionMutator from '../../../src/mutator/PrefixUnaryExpressionMutator';
import { expectMutation } from './mutatorAssertions';

describe('PrefixUnaryExpressionMutator', () => {

  let sut: PrefixUnaryExpressionMutator;

  beforeEach(() => {
    sut = new PrefixUnaryExpressionMutator();
  });

  it('should have name "PrefixUnaryExpression"', () => {
    expect(sut.name).eq('PrefixUnaryExpression');
  });

  it('should mutate -a to +a', () => {
    expectMutation(sut, '-a', '+a');
  });

  it('should mutate +a to -a', () => {
    expectMutation(sut, '+a', '-a');
  });

  it('should mutate ~a to a', () => {
    expectMutation(sut, '~a', 'a');
  });

  it('should mutate !a to a', () => {
    expectMutation(sut, '!a', 'a');
  });

  it('should mutate ++a to --a', () => {
    expectMutation(sut, '++a', '--a');
  });

  it('should mutate --a to ++a', () => {
    expectMutation(sut, '--a', '++a');
  });

  it('should not mutate a+a', () => {
    expectMutation(sut, 'a+a');
  });
  
  it('should not mutate a-a', () => {
    expectMutation(sut, 'a-a');
  });
});