import ArrayDeclaratorMutator from '../../../src/mutators/ArrayDeclaratorMutator';
import { expect } from 'chai';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import * as estree from 'estree';

describe('BlockStatementMutator', () => {
  let sut: ArrayDeclaratorMutator;

  beforeEach(() => sut = new ArrayDeclaratorMutator());
  
  const getVariableDeclaration = (program: estree.Program) => (program.body[0] as estree.VariableDeclaration);

  const getArrayExpression = (program: estree.Program) => {
    const variableDeclaration = getVariableDeclaration(program);
    return (variableDeclaration.declarations[0].init as estree.ArrayExpression);
  };

  const getArrayCallExpression = (program: estree.Program) => {
    const variableDeclaration = getVariableDeclaration(program);
    return (variableDeclaration.declarations[0].init as estree.SimpleCallExpression);
  };

  const getArrayNewExpression = (program: estree.Program) => {
    const variableDeclaration = getVariableDeclaration(program);
    return (variableDeclaration.declarations[0].init as estree.NewExpression);
  };
  
  it('should mutate when supplied with an array expression', () => {
    // Arrange
    const program = parser.parse(`var array = [1,2,3];`);
    const arrayExpression = getArrayExpression(program);

    // Act
    const actual = <estree.ArrayExpression>sut.applyMutations(arrayExpression, copy);

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(arrayExpression.nodeID);
    expect(actual.elements).to.have.length(0);
  });

  it('should mutate when supplied with an array `call` expression', () => {
    // Arrange
    const program = parser.parse(`var array = Array(1,2,3);`);
    const arrayExpression = getArrayCallExpression(program);

    // Act
    const actual = <estree.CallExpression>sut.applyMutations(arrayExpression, copy);

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(arrayExpression.nodeID);
    expect(actual.arguments).to.have.length(0);
  });

  it('should mutate when supplied with an array `new` expression', () => {
    // Arrange
    const program = parser.parse(`var array = new Array(1,2,3);`);
    const arrayExpression = getArrayNewExpression(program);

    // Act
    const actual = <estree.CallExpression>sut.applyMutations(arrayExpression, copy);

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(arrayExpression.nodeID);
    expect(actual.arguments).to.have.length(0);
  });

  it('should not mutate an empty expression', () => {
    // Arrange
    const program = parser.parse(`var array = []`);
    const emptyArrayExpression = getArrayExpression(program);

    // Act
    const actual = sut.applyMutations(emptyArrayExpression, copy);
    expect(actual).to.be.undefined;
  });

  it('should not mutate an empty `call` expression', () => {
    // Arrange
    const program = parser.parse(`var array = Array()`);
    const emptyCallExpression = getArrayExpression(program);

    // Act
    const actual = sut.applyMutations(emptyCallExpression, copy);
    expect(actual).to.be.undefined;
  });

  it('should not mutate an empty `new` expression', () => {
    // Arrange
    const program = parser.parse(`var array = new Array()`);
    const emptyNewExpression = getArrayExpression(program);

    // Act
    const actual = sut.applyMutations(emptyNewExpression, copy);
    expect(actual).to.be.undefined;
  });
});