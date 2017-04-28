import { expect } from 'chai';
import * as estree from 'estree';
import { Identified, IdentifiedNode } from 'stryker-api/mutant';
import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { parse, generate } from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';

describe('BooleanSubstitutionMutator', () => {
  let sut: BooleanSubstitutionMutator;

  beforeEach(() => {
    sut = new BooleanSubstitutionMutator();
  });
  
  it('should mutate when supplied a expression with !', () => {
    // Arrange
    const program = parse(`!a.a()`);
    const nodeUnaryExpression = ((program.body[0] as estree.ExpressionStatement).expression as estree.UnaryExpression & Identified);

    // Act
    const result = sut.applyMutations(nodeUnaryExpression, copy)[0] as estree.Expression & Identified;

    // Assert
    expect(result).to.be.ok;
    expect(result.type).to.be.eq(nodeUnaryExpression.argument.type);
    expect(result.nodeID).to.be.eq(nodeUnaryExpression.nodeID);
    expect(generate(result)).to.be.eq('a.a()');
  });

  it('should mutate true -> false', () => {
    // Arrange
    const program = parse(`true`);
    const nodeLiteral = ((program.body[0] as estree.ExpressionStatement).expression as estree.Literal & Identified);

    // Act
    const result = sut.applyMutations(nodeLiteral, copy)[0] as estree.Literal & Identified;

    // Assert
    expect(result).to.be.ok;
    expect(result.value).to.be.false;
    expect(result.nodeID).to.be.eq(nodeLiteral.nodeID);
    expect(generate(result)).to.be.eq('false');
  });

  it('should mutate false -> true', () => {
    // Arrange
    const program = parse(`false`);
    const nodeLiteral = ((program.body[0] as estree.ExpressionStatement).expression as estree.Literal & Identified);

    // Act
    const result = sut.applyMutations(nodeLiteral, copy)[0] as estree.Literal & Identified;

    // Assert
    expect(result).to.be.ok;
    expect(result.value).to.be.true;
    expect(result.nodeID).to.be.eq(nodeLiteral.nodeID);
    expect(generate(result)).to.be.eq('true');
  });

  it('should not mutate other nodes', () => {
    // Arrange
    const invalidNode: IdentifiedNode = {
      type: 'Identifier',
    } as estree.Node & Identified;

    // Act
    const result = sut.applyMutations(invalidNode, copy);

    // Assert
    expect(result).to.have.lengthOf(0);
  });


});