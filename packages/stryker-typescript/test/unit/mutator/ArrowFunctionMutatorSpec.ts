import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';
import ArrowFunctionMutator from '../../../src/mutator/ArrowFunctionMutator';

describe('ArrowFunctionMutator', () => {

  let sut: ArrowFunctionMutator;

  beforeEach(() => {
    sut = new ArrowFunctionMutator();
  });

  it('should have name "ArrowFunction"', () => {
    expect(sut.name).eq('ArrowFunction');
  });

  it('should mutate an anonymous function with an inline return', () => {
    expectMutation(sut, 'const b = () => 4;', 'const b = () => undefined;');
  });

  it('should not mutate an anonymous function with a block as a body', () => {
    expectMutation(sut, 'const b = () => { return 4; }');
  });

});