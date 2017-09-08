import UnaryNotMutator from '../../../src/mutator/UnaryNotMutator';
import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';

describe('UnaryNotMutator', () => {
  let sut: UnaryNotMutator;

  beforeEach(() => {
    sut = new UnaryNotMutator();
  });

  it('should have name "UnaryNot"', () => {
    expect(sut.name).eq('UnaryNot');
  });

  it('should mutate `!a` into `a`', () => {
    expectMutation(sut, '!a', 'a');
  });

});