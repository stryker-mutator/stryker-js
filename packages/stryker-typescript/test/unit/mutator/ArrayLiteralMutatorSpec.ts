import { expect } from 'chai';
import ArrayLiteralMutator from '../../../src/mutator/ArrayLiteralMutator';
import { expectMutation } from './mutatorAssertions';


describe('ArrayLiteralMutator', () => {
  let sut: ArrayLiteralMutator;

  beforeEach(() => {
    sut = new ArrayLiteralMutator();
  });

  it('should have name "ArrayLiteral"', () => {
    expect(sut.name).eq('ArrayLiteral');
  });

  it('should mutate filled array literals as empty arrays', () => {
    expectMutation(sut, '[a, 1 + 1]', '[]');
    expectMutation(sut, `['val']`, '[]');
  });

  it('should not mutate array initializers (leave that for ArrayNewExpressionMutator)', () => {
    expectMutation(sut, `new Array()`);
    expectMutation(sut, `new Array(1, 2, 3)`);
  });

  it('should mutate empty array literals as a filled array', () => {
    expectMutation(sut, '[]', '[[]]');
  });
});