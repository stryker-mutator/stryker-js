import { expect } from 'chai';
import DoStatementMutator from '../../../src/mutator/DoStatementMutator';
import { expectMutation } from './mutatorAssertions';

describe('DoStatementMutator', () => {
  let sut: DoStatementMutator;

  beforeEach(() => {
    sut = new DoStatementMutator();
  });

  it('should have name "DoStatement"', () => {
    expect(sut.name).eq('DoStatement');
  });
  
  it('should mutate the expression of a do statement', () => {
    expectMutation(sut, 'do { console.log(); } while(a < b);', 'do { console.log(); } while(false);');
  });

});