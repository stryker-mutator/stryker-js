import BlockStatementMutator from '../../../src/mutators/BlockStatementMutator';
import { expect } from 'chai';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import { Syntax } from 'esprima';
import * as estree from 'estree';

describe('BlockStatementMutator', () => {
  let sut: BlockStatementMutator;

  beforeEach(() => sut = new BlockStatementMutator());

  it('should mutate when supplied a block statement', () => {
    // Arrange
    const program = parser.parse(`function a () { 
      'use strict';
    }`);
    const useStrictBlockStatement = (program.body[0] as estree.FunctionDeclaration).body;

    // Act
    const actual = <estree.BlockStatement>sut.applyMutations(useStrictBlockStatement, copy);

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(useStrictBlockStatement.nodeID);
    expect(actual.body).to.have.length(0);
  });

  it('should not mutate an empty expression', () => {
    // Arrange
    const program = parser.parse(`function a () { 
      
    }`);
    const emptyBlockStatement = (program.body[0] as estree.FunctionDeclaration).body;

    // Act
    const actual = sut.applyMutations(emptyBlockStatement, copy);
    expect(actual).to.not.be.ok;
  });
});