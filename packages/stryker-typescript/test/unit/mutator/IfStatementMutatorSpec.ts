import { expect } from 'chai';
import IfStatementMutator from '../../../src/mutator/IfStatementMutator';
import { expectMutation } from './mutatorAssertions';

describe('IfStatementMutator', () => {

  let sut: IfStatementMutator;

  beforeEach(() => {
    sut = new IfStatementMutator();
  });

  it('should have name "IfStatement"', () => {
    expect(sut.name).eq('IfStatement');
  });

  it('should mutate an expression to `true` and `false`', () => {
    expectMutation(sut, 'if(something){ a++ }', 'if(true){ a++ }', 'if(false){ a++ }');
  });

});