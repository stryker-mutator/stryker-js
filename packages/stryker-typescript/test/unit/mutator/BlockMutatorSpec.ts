import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';
import BlockMutator from '../../../src/mutator/BlockMutator';

describe('BlockMutator', () => {

  let sut: BlockMutator;

  beforeEach(() => {
    sut = new BlockMutator();
  });

  it('should have name "Block"', () => {
    expect(sut.name).eq('Block');
  });

  it('should mutate the block of a function into an empty block', () => {
    expectMutation(sut, 'function() { return 4; }', 'function() {}');
  });

  it('should mutate a single block', () => {
    expectMutation(sut, 'const a = 3; { const b = a; }', 'const a = 3; {}');
  });

  it('should not mutate an already empty block', () => {
    expectMutation(sut, 'function() {  }');
  });

  
});