import { expect } from 'chai';
import BinaryExpressionMutator from '../../../src/mutator/BinaryExpressionMutator';
import { expectMutation } from './mutatorAssertions';

describe('BinaryExpressionMutator', () => {
  let sut: BinaryExpressionMutator;

  beforeEach(() => {
    sut = new BinaryExpressionMutator();
  });

  it('should have name "BinaryExpression"', () => {
    expect(sut.name).eq('BinaryExpression');
  });

  it('should mutate + and -', () => {
    expectMutation(sut, 'a + b', 'a - b');
    expectMutation(sut, 'a - b', 'a + b');
  });

  it('should mutate *, % and /', () => {
    expectMutation(sut, 'a * b', 'a / b');
    expectMutation(sut, 'a / b', 'a * b');
    expectMutation(sut, 'a % b', 'a * b');
  });

  it('should mutate < and >', () => {
    expectMutation(sut, 'a < b', 'a >= b', 'a <= b');
    expectMutation(sut, 'a > b', 'a <= b', 'a >= b');
  });

  it('should mutate <= and >=', () => {
    expectMutation(sut, 'a <= b', 'a < b', 'a > b');
    expectMutation(sut, 'a >= b', 'a < b', 'a > b');
  });

  it('should mutate == and ===', () => { 
    expectMutation(sut, 'a == b', 'a != b');
    expectMutation(sut, 'a === b', 'a !== b');
  });

  it('should mutate != and !==', () => { 
    expectMutation(sut, 'a != b', 'a == b');
    expectMutation(sut, 'a !== b', 'a === b');
  });

  it('should mutate && and ||', () => { 
    expectMutation(sut, 'a && b', 'a || b');
    expectMutation(sut, 'a || b', 'a && b');
  });

});