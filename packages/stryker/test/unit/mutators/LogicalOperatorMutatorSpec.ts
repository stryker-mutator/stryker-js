import { expect } from 'chai';
import * as estree from 'estree';
import { Identified } from '../../../src/mutators/IdentifiedNode';
import LogicalOperatorMutator from '../../../src/mutators/LogicalOperatorMutator';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';

describe('LogicalOperatorMutator', () => {
  let sut: LogicalOperatorMutator;

  beforeEach(() => sut = new LogicalOperatorMutator());

  it('should mutate \'||\' to \'&&\'', () => {
    // Arrange
    const program = parser.parse(`true || false`);
    const logicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression & Identified);

    // Act
    const result = sut.applyMutations(logicalOperator, copy)[0] as estree.LogicalExpression & Identified;

    // Assert
    expect(result).to.be.ok;
    expect(result.nodeID).to.eq(logicalOperator.nodeID);
    expect(result.operator).to.be.eq('&&');
  });

  it('should mutate \'&&\' to \'||\'', () => {
    // Arrange
    const program = parser.parse(`false && false`);
    const logicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression & Identified);

    // Act
    const result = sut.applyMutations(logicalOperator, copy)[0] as estree.LogicalExpression & Identified;

    // Assert
    expect(result).to.be.ok;
    expect(result.nodeID).to.eq(logicalOperator.nodeID);
    expect(result.operator).to.be.eq('||');
  });
});
