import * as os from 'os';
import { expect } from 'chai';
import ForStatementMutator from '../../../src/mutator/ForStatementMutator';
import { expectMutation } from './mutatorAssertions';

describe('ForStatementMutator', () => {
  let sut: ForStatementMutator;

  beforeEach(() => {
    sut = new ForStatementMutator();
  });

  it('should have name "ForStatement"', () => {
    expect(sut.name).eq('ForStatement');
  });
  
  it('should mutate the condition of a for statement', () => {
    expectMutation(sut, 'for(let i=0;i<10; i++) { console.log(); }', 'for(let i=0;false; i++) { console.log(); }');
  });
  
  it('should mutate the condition of a for statement without a condition', () => {
    expectMutation(sut, 'for(let i=0;; i++) { console.log(); }', `for (let i = 0; false; i++) {${os.EOL}    console.log();${os.EOL}}`);
  });
  
});