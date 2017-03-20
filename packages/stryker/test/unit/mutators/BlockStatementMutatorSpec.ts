import { expect } from 'chai';
import * as estree from 'estree';
import { Identified } from 'stryker-api/mutant';
import BlockStatementMutator from '../../../src/mutators/BlockStatementMutator';
import { parse, identified } from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';

describe('BlockStatementMutator', () => {
  let sut: BlockStatementMutator;

  beforeEach(() => sut = new BlockStatementMutator());

  it('should mutate when supplied a block statement', () => {
    // Arrange
    const program = parse(`function a () { 
      'use strict';
    }`);
    const useStrictBlockStatement = identified((program.body[0] as estree.FunctionDeclaration).body);

    // Act
    const actual = sut.applyMutations(useStrictBlockStatement, copy) as estree.BlockStatement & Identified;

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(useStrictBlockStatement.nodeID);
    expect(actual.body).to.have.length(0);
  });

  it('should not mutate an empty expression', () => {
    // Arrange
    const program = parse(`function a () { 
      
    }`);
    const emptyBlockStatement = identified((program.body[0] as estree.FunctionDeclaration).body);

    // Act
    const actual = sut.applyMutations(emptyBlockStatement, copy);
    expect(actual).to.not.be.ok;
  });
});