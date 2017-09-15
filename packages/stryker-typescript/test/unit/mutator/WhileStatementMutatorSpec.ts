import { expect } from 'chai';
import WhileStatementMutator from '../../../src/mutator/WhileStatementMutator';
import { expectMutation } from './mutatorAssertions';

describe('WhileStatementMutator', () => {
  let sut: WhileStatementMutator;

  beforeEach(() => {
    sut = new WhileStatementMutator();
  });

  it('should have name "WhileStatement"', () => {
    expect(sut.name).eq('WhileStatement');
  });

  it('should mutate the expression of a while statement', () => {
    expectMutation(sut, 'while(a < b) { console.log(); }', 'while(false) { console.log(); }');
  });

});