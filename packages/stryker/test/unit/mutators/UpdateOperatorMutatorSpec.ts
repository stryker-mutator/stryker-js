import { Identified } from '../../../src/mutators/IdentifiedNode';
import UpdateOperatorMutator from '../../../src/mutators/UpdateOperatorMutator';
import { expect } from 'chai';
import * as parser from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import * as estree from 'estree';

describe('UpdateOperatorMutator', () => {
  let sut: UpdateOperatorMutator;

  beforeEach(() => sut = new UpdateOperatorMutator());

  describe('should mutate', () => {
    it('"i++" to "i--"', () => {
      // Arrange
      const program = parser.parse(`i++`);
      const expression = (program.body[0] as estree.ExpressionStatement).expression as estree.Expression & Identified;

      // Act
      const result = sut.applyMutations(expression, copy) as estree.UpdateExpression & Identified;

      // Assert
      expect(result).to.be.ok;
      expect(result.nodeID).to.eq(expression.nodeID);
      expect(result.operator).to.be.eq('--');
    });

    it('"i--" to "i++"', () => {
      // Arrange
      const program = parser.parse(`i--`);
      const expression = (program.body[0] as estree.ExpressionStatement).expression as estree.Expression & Identified;

      // Act
      const result = sut.applyMutations(expression, copy) as estree.UpdateExpression & Identified;

      // Assert
      expect(result).to.be.ok;
      expect(result.nodeID).to.eq(expression.nodeID);
      expect(result.operator).to.be.eq('++');
    });

    it('"++i" to "--i"', () => {
      // Arrange
      const program = parser.parse(`++i`);
      const expression = (program.body[0] as estree.ExpressionStatement).expression as estree.Expression & Identified;

      // Act
      const result = sut.applyMutations(expression, copy) as estree.UpdateExpression & Identified;

      // Assert
      expect(result).to.be.ok;
      expect(result.nodeID).to.eq(expression.nodeID);
      expect(result.operator).to.be.eq('--');
    });

    it('"--i" to "++i"', () => {
      // Arrange
      const program = parser.parse(`--i`);
      const expression = (program.body[0] as estree.ExpressionStatement).expression as estree.Expression & Identified;

      // Act
      const result = sut.applyMutations(expression, copy) as estree.UpdateExpression & Identified;

      // Assert
      expect(result).to.be.ok;
      expect(result.nodeID).to.eq(expression.nodeID);
      expect(result.operator).to.be.eq('++');
    });
  });

  describe('should not mutate', () => {
    it('"+i" to "-i"', () => {
      // Arrange
      const program = parser.parse(`-i`);
      const expression = (program.body[0] as estree.ExpressionStatement).expression as estree.Expression & Identified;

      // Act
      const result = sut.applyMutations(expression, copy);

      // Assert
      expect(result).to.be.undefined;
    });
  });

});
