import LogicalOperatorMutator from '../../../src/mutators/LogicalOperatorMutator';
import { expect } from 'chai';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import * as estree from 'estree';

describe('LogicalOperatorMutator', () => {
  let sut: LogicalOperatorMutator;

  beforeEach(() => sut = new LogicalOperatorMutator());

  it('should mutate \'||\' to \'&&\'', () => {
    // Arrange
    const program = parser.parse(`true || false`);
    const logicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression);

    // Act
    const result = <estree.LogicalExpression> sut.applyMutations(logicalOperator, copy)[0];

    // Assert
    expect(result).to.be.ok;
    expect(result.nodeID).to.eq(logicalOperator.nodeID);
    expect(result.operator).to.be.eq('&&');
  });

  it('should mutate \'&&\' to \'||\'', () => {
    // Arrange
    const program = parser.parse(`false && false`);
    const logicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression);
    
    // Act
    const result = <estree.LogicalExpression> sut.applyMutations(logicalOperator, copy)[0];

    // Assert
    expect(result).to.be.ok;
    expect(result.nodeID).to.eq(logicalOperator.nodeID);
    expect(result.operator).to.be.eq('||');
  });
});
