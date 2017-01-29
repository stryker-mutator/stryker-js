import LogicalOperatorMutator from '../../../src/mutators/LogicalOperatorMutator';
import { expect } from 'chai';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import { Syntax } from 'esprima';
import * as estree from 'estree';

describe('LogicalOperatorMutator', () => {
  let sut: LogicalOperatorMutator;

  beforeEach(() => sut = new LogicalOperatorMutator());

  it('should mutate \'||\' to \'&&\'', () => {
    // Arrange
    const program = parser.parse(`true || false`);
    const useStrictLogicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression);

    // Act
    const actual = <estree.LogicalExpression> sut.applyMutations(useStrictLogicalOperator, copy)[0];

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(useStrictLogicalOperator.nodeID);
    expect(actual.operator).to.be.eq('&&');
  });

  it('should mutate \'&&\' to \'||\'', () => {
    // Arrange
    const program = parser.parse(`false && false`);
    const useStrictLogicalOperator = ((program.body[0] as estree.ExpressionStatement).expression as estree.LogicalExpression);
    
    // Act
    const actual = <estree.LogicalExpression> sut.applyMutations(useStrictLogicalOperator, copy)[0];

    // Assert
    expect(actual).to.be.ok;
    expect(actual.nodeID).to.eq(useStrictLogicalOperator.nodeID);
    expect(actual.operator).to.be.eq('||');
  });
});